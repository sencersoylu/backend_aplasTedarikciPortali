const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');

const table = "genel_para_birimi";
const keyExpr = "genelParaBirimiID";

router.post('/boxSiparistenIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} ORDER BY ad ASC`;
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

router.post('/boxKesinSiparisDetay', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} ORDER BY ad ASC`;
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

router.post('/boxUrunYonetimiUrunFiyatTablosuDetay', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} ORDER BY ad ASC`;
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

router.post('/boxUrunYonetimiTedarikciUrun', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} ORDER BY ad ASC`;
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

module.exports = router;