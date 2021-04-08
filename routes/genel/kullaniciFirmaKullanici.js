const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "kullanici_firma_kullanici";
const keyExpr = "kullaniciFirmaKullaniciID";
const parentKeyExpr = "kullaniciFirmaID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function(req, res) {

    const filterData = req.body;
    
    let rawQuery = "SELECT x.*, CONCAT(kul.kisiAdi, ' ', kul.kisiSoyadi) AS kisiAdSoyad, adr.kisaKodu, adr.adres FROM " + table + " as x LEFT JOIN kullanici as kul ON kul.kullaniciUUID = x.kullaniciID LEFT JOIN kullanici_firma_adres as adr ON adr.kullaniciFirmaAdresID = x.kullaniciFirmaAdresID ORDER BY x." + keyExpr + " DESC";

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

router.post('/get', async function(req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});


router.post('/update', async function(req, res) {

    await crudHelper.updateR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});


router.post('/create', async function(req, res) {

    await crudHelper.createR({
        body: req.body,
        table: table,
        keyExpr: keyExpr,
        parentKeyExpr: parentKeyExpr
    }, (data, err) => {
        if (data) {
            res.status(201).json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

router.post('/delete', async function(req, res) {

    await crudHelper.deleteR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            return res.json(data);
        }
        
        if (err) {
            return res.status(400).json(err);
        }
    });

});

module.exports = router;
