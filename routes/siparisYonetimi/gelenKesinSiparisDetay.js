const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "siparis_yonetimi_siparis_detay";
const keyExpr = "siparisYonetimiSiparisDetayID";
const parentKeyExpr = "siparisYonetimiSiparisID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = filterData.userData.parentID;

    if(!parentID){
        return res.status(400).json({
            validationError: "parent id boş olamaz!"
        });
    }

    let rawQuery = "SELECT t.*, tedUrun.kodu as tedarikciUrunuKod, tedUrun.adi as tedarikciUrunuAd, CONCAT('[ ',gob.kodu,' ] ', gob.adi) as olcuBirimi, gpb.ad as paraBirimi FROM " + table + " as t LEFT JOIN urun_yonetimi_tedarikci_urun as tedUrun ON tedUrun.urunYonetimiTedarikciUrunID = t.tedarikciUrunID LEFT JOIN genel_olcu_birimi as gob ON gob.genelOlcuBirimiID = t.genelOlcuBirimiID LEFT JOIN genel_para_birimi as gpb ON gpb.genelParaBirimiID = t.genelParaBirimiID WHERE t."+parentKeyExpr+" = "+parentID;

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

        const parentRecord = (await db.sequelize.query(`SELECT * FROM siparis_yonetimi_siparis WHERE ${parentKeyExpr} = ${req.body.data[parentKeyExpr]} LIMIT 1`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.error(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (parentRecord && !!parentRecord['sonrakiSiparisID']) {
            throw "revizyona uğramış siparişin  detayları güncellenemez";
        }

        const miktar = req.body.data['miktar'] ? Number(req.body.data['miktar']) : 0;
        const birimFiyat = req.body.data['birimFiyat'] ? Number(req.body.data['birimFiyat']) : 0;

        req.body.data['tutar'] = miktar * birimFiyat;

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

    const mevcutKalemler = await db.sequelize.query(`SELECT * FROM ${table} WHERE ${parentKeyExpr} = ${userData.parentID} AND tedarikciUrunID = ${data.tedarikciUrunID} AND genelOlcuBirimiID = ${data.genelOlcuBirimiID}`, {type: db.Sequelize.QueryTypes.SELECT})
    .catch(err => {
        console.log(err);
        return res.status(400).json({validationError: "sorgulama esnasında hata oluştu!"});
    });

    if(mevcutKalemler.length > 0){
        return res.status(400).json({validationError: "aynı ürün ve ölçü birimine ait kayıt zaten mevcut!"});
    }
    else{

        const miktar = req.body.data['miktar'] ? Number(req.body.data['miktar']) : 0;
        const birimFiyat = req.body.data['birimFiyat'] ? Number(req.body.data['birimFiyat']) : 0;

        req.body.data['tutar'] = miktar * birimFiyat;

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, (data, err) => {
            if (data) {
    
                return res.json(data);
    
            }
    
            if (err) {
                return res.status(400).json(err);
            }
        });

    }

 
});


router.post('/delete', async function (req, res) {


    try {

        await crudHelper.deleteR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {

            if (data) {
                return res.json(data);
            }

            if (err) {
                throw err;
            }
        });
    }
    catch (err) {

        console.error("HATAAA:", err);
        return res.status(400).json(err);

    }



});

module.exports = router;