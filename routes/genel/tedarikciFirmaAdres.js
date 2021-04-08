const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "tedarikci_firma_adres";
const keyExpr = "tedarikciFirmaAdresID";
const parentKeyExpr = "tedarikciFirmaID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/boxSiparisYonetimiKesinSiparis', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} WHERE tedarikciFirmaID = ${filterData.tedarikciID} ORDER BY kisaKodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} = ${filterData.ID}`;
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
    const parentID = +req.body.userData.parentID;

    let rawQuery = "SELECT x.*, firma.firmaAdi, firma.firmaKodu, ulke.adi as ulke, il.adi as il FROM " + table + " as x LEFT JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = x.tedarikciFirmaID LEFT JOIN genel_ulke as ulke ON ulke.genelUlkeID = x.genelUlkeID LEFT JOIN genel_il as il ON il.genelIlID = x.genelIlID WHERE x."+ parentKeyExpr + " = "+ parentID+" ORDER BY x." + keyExpr + " DESC";

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
