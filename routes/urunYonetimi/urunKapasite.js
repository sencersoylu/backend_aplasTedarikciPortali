const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "urun_yonetimi_urun_kapasite";
const keyExpr = "urunYonetimiUrunKapasiteID";

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const userFirmaID = filterData.userData.userFirmaID;
        const userFirmaTurID = filterData.userData.userFirmaTurID;

        let whereCond = "";
 
        if(userFirmaTurID == 2){
            whereCond = "WHERE firma.tedarikciFirmaID = '" + userFirmaID + "'";
        }

        let rawQuery = `SELECT t.*, urun.adi as urunAdi, birim.adi as olcuBirimi, firma.firmaAdi, adr.kisaKodu as adres FROM ${table} as t LEFT JOIN urun_yonetimi_uretici_urun as urun ON urun.urunYonetimiUreticiUrunID = t.urunYonetimiUreticiUrunID LEFT JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma_adres as adr ON adr.kullaniciFirmaAdresID = t.kullaniciFirmaAdresID LEFT JOIN genel_olcu_birimi as birim ON birim.genelOlcuBirimiID = urun.genelOlcuBirimiID ${whereCond} ORDER BY t.createdAt DESC`;

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

        if(data['baslangicTarihi'] > data['bitisTarihi']){
            throw "Sevk başlangıç tarihi, Sevk Bitiş tarihinden büyük olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table} WHERE kullaniciFirmaAdresID = :adresID AND tedarikciFirmaID = :firmaID AND urunYonetimiUreticiUrunID = :urunID AND bitisTarihi > :basTarih`, { 
            type: db.Sequelize.QueryTypes.SELECT,
            replacements: {
                adresID: data['kullaniciFirmaAdresID'],
                firmaID: data['tedarikciFirmaID'],
                urunID: data['urunYonetimiUreticiUrunID'],
                basTarih: data['baslangicTarihi']
            } 
        })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {
            throw "bu lokasyon, firma ve ürün için ilgili sevk bitiş tarihinden önce kayıt zaten mevcut!";
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

        if (!data) {
            throw "Data boş olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table} WHERE tedarikciFirmaID =:firmaID AND urunYonetimiUreticiUrunID = :urunID AND ${keyExpr} != :id`, { type: db.Sequelize.QueryTypes.SELECT,replacements: {
            firmaID: data['tedarikciFirmaID'],
            urunID: data['urunYonetimiUreticiUrunID'],
            id: data[keyExpr]
        } })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {
            throw "bu firma için ilgili ürün zaten mevcut!";
        }

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
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

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
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

module.exports = router;