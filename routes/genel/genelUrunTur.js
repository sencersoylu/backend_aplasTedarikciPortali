const express = require('express');
const router = express.Router();

const table = "genel_urun_tur";
const keyExpr = "genelUrunTurID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/boxUrunYonetimiUreticiUrun', async function(req, res) {

    const filterData = req.body;
    const firmaID = filterData.userData.userFirmaID;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT *, CONCAT('[ ',kodu,' ] ', adi) as koduAdi FROM ${table} ORDER BY kodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT *, CONCAT('[ ',kodu,' ] ', adi) as koduAdi FROM ${table} WHERE ${keyExpr} = ${filterData.ID}`;
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

    let rawQuery = `SELECT * FROM ${table} ORDER BY kodu ASC`;

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
        keyExpr: keyExpr
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
