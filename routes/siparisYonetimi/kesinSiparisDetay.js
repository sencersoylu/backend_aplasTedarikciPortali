const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis_detay";
const keyExpr = "siparisYonetimiKesinSiparisDetayID";
const parentKeyExpr = "siparisYonetimiKesinSiparisID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = filterData.userData.parentID;

    if (!parentID) {
        return res.status(400).json({
            validationError: "parent id boş olamaz!"
        });
    }

    let rawQuery = "SELECT t.*, CONCAT('[ ',gob.kodu,' ] ', gob.adi) as olcuBirimi, CONCAT('[ ',tas.kodu,' ] ', tas.adi) as tasiyici FROM " + table + " as t LEFT JOIN genel_olcu_birimi as gob ON gob.genelOlcuBirimiID = t.genelOlcuBirimiID LEFT JOIN genel_urun_tasiyici as tas ON tas.genelUrunTasiyiciID = t.genelUrunTasiyiciID WHERE t." + parentKeyExpr + " = " + parentID;

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

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM siparis_yonetimi_kesin_siparis as sip 
        LEFT JOIN (
            SELECT
                siparisYonetimiKesinSiparisOperasyonID as operasyonID,
                ${parentKeyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${parentKeyExpr}
            HAVING
                MAX(
                    siparisYonetimiKesinSiparisHareketID
                )
        ) AS sonHar ON sonHar.${parentKeyExpr} = sip.${parentKeyExpr} 
        WHERE sip.${parentKeyExpr} = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];



        if (sipDurum) {
            
            if(sipDurum['siparisDurumID'] == 2){
                if(sipDurum['operasyonID'] == 7){
                    throw "tamamlanmış sipariş güncellenemez!";
                }
                

            }
        }

        const siparisMiktari = req.body.data['siparisMiktari'] ? Number(req.body.data['siparisMiktari']) : 0;
        const sevkMiktari = req.body.data['sevkMiktari'] ? Number(req.body.data['sevkMiktari']) : 0;
        req.body.data['siparisMiktari'] = siparisMiktari;
        req.body.data['sevkMiktari'] = sevkMiktari;

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

const operasyonHareketiEkle = require('./kesinSiparisOperasyonKaydi');

router.post('/create', async function (req, res) {

    const data = req.body.data;
    const userData = req.body.userData;

    const mevcutKalemler = await db.sequelize.query(`SELECT * FROM ${table} WHERE ${parentKeyExpr} = ${userData.parentID} AND urunYonetimiUreticiUrunID = ${data.urunYonetimiUreticiUrunID} AND genelOlcuBirimiID = ${data.genelOlcuBirimiID} AND genelUrunTasiyiciID = ${data.genelUrunTasiyiciID}`, { type: db.Sequelize.QueryTypes.SELECT })
        .catch(err => {
            console.log(err);
            return res.status(400).json({ validationError: "sorgulama esnasında hata oluştu!" });
        });

    if (mevcutKalemler.length > 0) {
        return res.status(400).json({ validationError: "aynı ürün, birim ve taşıyıcıya ait kayıt zaten mevcut!" });
    }
    else {

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
                await operasyonHareketiEkle(data[keyExpr], 2, req);

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
            throw "tedarikçi sipariiş detaylarını silemez!";
        }

        const record = (await db.sequelize.query(`SELECT t.*, sip.siparisDurumID FROM ${table} as t LEFT JOIN siparis_yonetimi_kesin_siparis as sip ON sip.${parentKeyExpr} = t.${parentKeyExpr} WHERE t.${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Kayıt sorgulama esnasında hata oluştu!";
            }))[0];

        if (record) {
            if (record.siparisDurumID != 1) {
                throw "sadece taslak siparişe ait detaylar silinebilir";
            }
            else {

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