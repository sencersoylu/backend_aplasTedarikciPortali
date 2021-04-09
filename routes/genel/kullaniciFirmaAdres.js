const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "kullanici_firma_adres";
const keyExpr = "kullaniciFirmaAdresID";
const parentKeyExpr = "kullaniciFirmaID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/boxIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";
    } else { // tek kayıt
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x." + keyExpr + " = " + filterData.ID;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/boxSiparisYonetimiKesinSiparis', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";
    } else { // tek kayıt
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x." + keyExpr + " = " + filterData.ID;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/boxStokKarti', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";
    } else { // tek kayıt
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x." + keyExpr + " = " + filterData.ID;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/boxKullaniciFirmaTeslimYeri', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";
    } else { // tek kayıt
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x." + keyExpr + " = " + filterData.ID;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});


router.post('/boxKullaniciFirmaKullanici', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";
    } else { // tek kayıt
        rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x." + keyExpr + " = " + filterData.ID;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});


router.post('/getList', async function(req, res) {

    const filterData = req.body;
    
    let rawQuery = "SELECT x.*, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID ORDER BY x." + keyExpr + " DESC";

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
        keyExpr: keyExpr,
        parentKeyExpr: parentKeyExpr
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
