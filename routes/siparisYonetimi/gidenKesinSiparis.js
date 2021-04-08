const { filter } = require('async');
const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "siparis_yonetimi_siparis";
const keyExpr = "siparisYonetimiSiparisID";

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const userFirmaTurID = +filterData.userData.userFirmaTurID;
        const userFirmaID = +filterData.userData.userFirmaID;

        let rawQuery;

        if (userFirmaTurID == 1) { // uretici firma
            rawQuery = `SELECT t.*, t.createdAt as dokumanTarihi, durum.adi as durumu, tedarikciFirma.firmaAdi as tedarikciFirma, ureticiFirma.firmaAdi as ureticiFirma, uretAdres.adres as varisYeri, tedAdres.adres as cikisYeri  FROM ${table} as t LEFT JOIN genel_firma as tedarikciFirma ON tedarikciFirma.genelFirmaID = t.tedarikciFirmaID LEFT JOIN genel_firma as ureticiFirma ON ureticiFirma.genelFirmaID = t.ureticiFirmaID  LEFT JOIN genel_firma_adres as tedAdres ON tedAdres.genelFirmaAdresID = t.cikisAdresiID LEFT JOIN genel_firma_adres as uretAdres ON uretAdres.genelFirmaAdresID = t.varisAdresiID LEFT JOIN siparis_yonetimi_siparis_durum as durum ON durum.siparisYonetimiSiparisDurumID = t.siparisDurumID WHERE t.siparisDurumID IN (1,2,7,8,9,10,11) AND t.ureticiFirmaID = ${userFirmaID} AND ureticiyeGorunsunMu = 1 ORDER BY t.${keyExpr} DESC`;
        }
        else if (userFirmaTurID == 2) { // tedarikci firma
            rawQuery = `SELECT t.*, t.createdAt as dokumanTarihi, durum.adi as durumu, tedarikciFirma.firmaAdi as tedarikciFirma, ureticiFirma.firmaAdi as ureticiFirma, uretAdres.adres as varisYeri, tedAdres.adres as cikisYeri  FROM ${table} as t LEFT JOIN genel_firma as tedarikciFirma ON tedarikciFirma.genelFirmaID = t.tedarikciFirmaID LEFT JOIN genel_firma as ureticiFirma ON ureticiFirma.genelFirmaID = t.ureticiFirmaID  LEFT JOIN genel_firma_adres as tedAdres ON tedAdres.genelFirmaAdresID = t.cikisAdresiID LEFT JOIN genel_firma_adres as uretAdres ON uretAdres.genelFirmaAdresID = t.varisAdresiID LEFT JOIN siparis_yonetimi_siparis_durum as durum ON durum.siparisYonetimiSiparisDurumID = t.siparisDurumID WHERE t.siparisDurumID IN (3,4,5,6) AND t.tedarikciFirmaID = ${userFirmaID} AND tedarikciyeGorunsunMu = 1  ORDER BY t.${keyExpr} DESC`;
        }



        await crudHelper.getListR({
            data: filterData,
            rawQuery: rawQuery
        }, (data, err) => {
            if (data) {
                res.json(data);
            }

            if (err) {
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        if (data['siparisDurumID'] > 1) {
            throw "Taslak Sipariş, öncelikle tedarikçi onayına sunulmalıdır!";
        }

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                console.error(err)
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.status(200).json(data);
        }

        if (err) {
            console.error(err);
            res.status(400).json(err);
        }
    });

});

router.post('/update', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];
        let userData = body['userData'];

        if (!data) {
            throw "Data boş olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table} WHERE ${keyExpr} = ${data[keyExpr]}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {

            if (!!oldRecord['sonrakiSiparisID']) {
                throw "revizyona uğramış döküman güncellenemez!";
            }

            if (oldRecord['siparisDurumID'] == 10) {
                throw "İptal edilen sipariş güncellenemez!";
            }

            if (oldRecord['siparisDurumID'] == 11) {
                throw "Tamamlanan sipariş güncellenemez!";
            }

            // durum değişikliği varsa yeni sipariş dökümanı oluşturuluyor
            if (oldRecord['siparisDurumID'] != data['siparisDurumID']) {

                const oldID = oldRecord[keyExpr];

                delete oldRecord[keyExpr];
                delete oldRecord['createdUserID'];
                delete oldRecord['updatedUserID'];
                delete oldRecord['createdAt'];
                delete oldRecord['updatedAt'];

                oldRecord['createdUserID'] = userData.userID;
                oldRecord['siparisDurumID'] = data['siparisDurumID'];

                const newRecord = await db[table].create(oldRecord).catch(e => {
                    console.log(e);
                    throw "sipariş dökümanı oluşturulurken hatayla karşılaşıldı!"
                });

                const newID = newRecord[keyExpr];

                const oldSiparisKalemleri = await db.sequelize.query(`SELECT * FROM siparis_yonetimi_siparis_detay WHERE siparisYonetimiSiparisID = ${oldID}`, { type: db.Sequelize.QueryTypes.SELECT })
                    .catch(e => {
                        console.log(e);
                        throw "Detay Sorgulaması esnasında hata oluştu!";
                    });

                if (oldSiparisKalemleri.length > 0) {

                    const newKalemler = oldSiparisKalemleri.map(t => {
                        delete t['createdUserID'];
                        delete t['updatedUserID'];
                        delete t['createdAt'];
                        delete t['updatedAt'];
                        delete t[keyExpr];
                        delete t['siparisYonetimiSiparisDetayID'];

                        t['createdUserID'] = userData.userID;
                        t[keyExpr] = newID;

                        return t;
                    });

                    await db['siparis_yonetimi_siparis_detay'].bulkCreate(newKalemler)
                        .catch(e => {
                            console.log(e);
                            throw "sipariş dökümanındaki detayları oluştururken hatayla karşılaşıldı!"
                        });

                }

                req.body.data['sonrakiSiparisID'] = newRecord[keyExpr];
                req.body.data['siparisDurumID'] = oldRecord['siparisIDurumID']

                await crudHelper.updateR({
                    body: req.body,
                    table: table,
                    keyExpr: keyExpr
                }, (data, err) => {
                    if (data) {
                        res.status(200).json(data);
                    }

                    if (err) {
                        console.error(err);
                        res.status(400).json(err);
                    }
                });


            }
            else {

                await crudHelper.updateR({
                    body: req.body,
                    table: table,
                    keyExpr: keyExpr
                }, (data, err) => {
                    if (data) {
                        res.status(200).json(data);
                    }

                    if (err) {
                        console.error(err);
                        res.status(400).json(err);
                    }
                });

            }
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const id = req.body.ID;
        
        const filterData = req.body;
        const userFirmaTurID = filterData.userData.userFirmaTurID;

        let gorunsunMuFieldName;

        if (userFirmaTurID == 1) { // uretici firma
            gorunsunMuFieldName = "ureticiyeGorunsunMu"
        }
        else if (userFirmaTurID == 2) { // tedarikci firma
            gorunsunMuFieldName = "tedarikciyeGorunsunMu"
        }

        await db.sequelize.query(`UPDATE ${table} SET ${gorunsunMuFieldName} = 0 WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.SELECT})
        .catch(e => {
            console.log(e);
            throw "Çöp kutusuna atma esnasında hata oluştu!";
        });
        
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

module.exports = router;