const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis_detay";
const keyExpr = "siparisYonetimiKesinSiparisDetayID";
const parentKeyExpr = "siparisYonetimiKesinSiparisID";

const crudHelper = require('../../helpers/crudHelper');
const operasyonHareketiEkle = require('./kesinSiparisOperasyonKaydi');
const durumGuncelle = require('./kesinSiparisDurumGuncelleme');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = filterData.userData.parentID;

    if (!parentID) {
        return res.status(400).json({
            validationError: "parent id boş olamaz!"
        });
    }

    let rawQuery = "SELECT t.*, CONCAT('[ ',gob.kodu,' ] ', gob.adi) as olcuBirimi FROM " + table + " as t LEFT JOIN genel_olcu_birimi as gob ON gob.genelOlcuBirimiID = t.genelOlcuBirimiID WHERE t." + parentKeyExpr + " = " + parentID;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            return res.status(201).json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });


});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            return res.status(201).json(data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });

});


router.post('/update', async function (req, res) {

    try {

        const siparisID = req.body.data[parentKeyExpr];
        const firmaTurID = req.body.userData.userFirmaTurID;

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM siparis_yonetimi_kesin_siparis as sip 
        LEFT JOIN (
            SELECT
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${parentKeyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${parentKeyExpr}
        ) AS sonHar ON sonHar.${parentKeyExpr} = sip.${parentKeyExpr} 
        WHERE sip.${parentKeyExpr} = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];



        if (sipDurum) {


            if (firmaTurID == 1) {

                if (sipDurum['siparisDurumID'] != 1) {
                    throw "sadece taslak halindeki siparişin detayı güncellenebilir!"
                }
                else {

                    if (sipDurum['operasyonID'] == 3) {
                        throw "onaya çıkarılmış sipariş detayı güncellenemez!";
                    }


                }

                if (sipDurum['siparisDurumID'] == 2) {
                    if (sipDurum['operasyonID'] == 7) {
                        throw "tamamlanmış sipariş güncellenemez!";
                    }


                }

            }
            else if (firmaTurID == 2) {

                if (sipDurum['siparisDurumID'] == 1) {
                    if (sipDurum['operasyonID'] != 3) {
                        throw "sadece onayınıza çıkmış siparişin detayını güncelleyebilirsiniz!";
                    }
                }
                else {

                    if (sipDurum['siparisDurumID'] == 4) {
                        throw "tamamlanmış sipariş güncellenemez!";
                    }

                    else if (sipDurum['siparisDurumID'] == 3) {
                        throw "iptal edilmiş sipariş güncellenemez!";
                    }

                    else if (sipDurum['siparisDurumID'] == 2) {
                        throw "şartlı onayladığınız siparişi güncelleyemezsiniz!";
                    }


                }

            }


        }

        const siparisMiktari = req.body.data['siparisMiktari'] ? Number(req.body.data['siparisMiktari']) : 0;
        const sevkMiktari = req.body.data['sevkMiktari'] ? Number(req.body.data['sevkMiktari']) : 0;
        req.body.data['siparisMiktari'] = siparisMiktari;
        req.body.data['sevkMiktari'] = sevkMiktari;

        if (siparisMiktari == 0) {
            throw "sipariş miktarı 0'dan büyük olmalıdır!"
        }

        if (firmaTurID == 2) {
            if (siparisMiktari != sevkMiktari) {
                // şartlı onay durum güncelleme
                await durumGuncelle(siparisID, 4, req);

            }

        }

        await crudHelper.updateR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, (data, err) => {
            if (data) {

                return res.json("OK");

            }

            if (err) {
                return res.status(400).json(err);
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }

});


router.post('/create', async function (req, res) {

    const data = req.body.data;
    const userData = req.body.userData;
    const userFirmaTurID = userData.userFirmaTurID;

    if(userFirmaTurID == 2){
        return res.status(400).json("tedarikçi sipariş detayı ekleyemez!");
    }

    const mevcutKalemler = await db.sequelize.query(`SELECT * FROM ${table} WHERE ${parentKeyExpr} = ${userData.parentID} AND urunYonetimiUreticiUrunID = ${data.urunYonetimiUreticiUrunID} AND genelOlcuBirimiID = ${data.genelOlcuBirimiID}`, { type: db.Sequelize.QueryTypes.SELECT })
        .catch(err => {
            console.log(err);
            return res.status(400).json({ validationError: "sorgulama esnasında hata oluştu!" });
        });

    if (mevcutKalemler.length > 0) {
        return res.status(400).json({ validationError: "aynı ürün ve birim için kayıt zaten mevcut!" });
    }
    else {

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM siparis_yonetimi_kesin_siparis as sip
        LEFT JOIN (
            SELECT
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${parentKeyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${parentKeyExpr}
        ) AS sonHar ON sonHar.${parentKeyExpr} = sip.${parentKeyExpr} 
        WHERE sip.${parentKeyExpr} = ${userData.parentID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Durum Sorgulama esnasında hata oluştu!";
            }))[0];

        if (sipDurum) {

            if (sipDurum['siparisDurumID'] != 1) {
                return res.status(400).json({ validationError: "sadece taslak halindeki siparişe detay eklenebilir!" });
            }
            else {

                if (sipDurum['operasyonID'] == 3) {
                    return res.status(400).json({ validationError: "onaya çıkarılmış siparişe detay eklenemez!" });
                }

                if ([5,6,7].includes(sipDurum['operasyonID'])) {
                    return res.status(400).json({ validationError: "onaylanmış siparişe detay eklenemez!" });
                }

            }

        }

        const siparisMiktari = req.body.data['siparisMiktari'] ? Number(req.body.data['siparisMiktari']) : 0;
        const sevkMiktari = req.body.data['sevkMiktari'] ? Number(req.body.data['sevkMiktari']) : 0;
        req.body.data['siparisMiktari'] = siparisMiktari;
        req.body.data['sevkMiktari'] = sevkMiktari;

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, async (data, err) => {
            if (data) {

                res.json(data);

                // hareket kaydı
                await operasyonHareketiEkle(data[parentKeyExpr], 2, req);

            }

            if (err) {
                return res.status(400).json(err);
            }
        });

    }


});


router.post('/delete', async function (req, res) {


    try {

        const id = req.body.ID;
        const userFirmaTurID = +req.body.userData.userFirmaTurID;

        if (userFirmaTurID == 2) {
            throw "tedarikçi sipariş detaylarını silemez!";
        }

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM ${table} as t LEFT JOIN siparis_yonetimi_kesin_siparis as sip ON sip.${parentKeyExpr} = t.${parentKeyExpr}
        LEFT JOIN (
            SELECT
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${parentKeyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${parentKeyExpr}
        ) AS sonHar ON sonHar.${parentKeyExpr} = sip.${parentKeyExpr} 
        WHERE t.${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (sipDurum) {
            if (sipDurum.siparisDurumID != 1) {
                throw "sadece taslak siparişe ait detaylar silinebilir";
            }
            else {

                if (!([1, 2].includes(sipDurum.operasyonID))) {
                    throw "sadece onaya çıkarılmamış taslak halindeki detaylar silinebilir!"
                }

                await crudHelper.deleteR({
                    body: req.body,
                    table: table,
                    keyExpr: keyExpr
                }, (data, err) => {
                    if (data) {
                        res.status(200).json(data);
                    }

                    if (err) {
                        res.status(400).json(err);
                    }
                });
            }
        }
        else {
            throw "aranan kayıt bulunamadı!";
        }

    }
    catch (err) {

        console.error("HATAAA:", err);
        return res.status(400).json(err);

    }



});

module.exports = router;