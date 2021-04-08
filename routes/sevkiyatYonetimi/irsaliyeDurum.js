const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');

const table = "sevkiyat_yonetimi_irsaliye_durum";
const keyExpr = "sevkiyatYonetimiIrsaliyeDurumID";

router.post('/boxGidenIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} IN (1,2)`;
    } else { // tek kayıt,
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

router.post('/boxGelenIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} IN (2,4)`;
    } else { // tek kayıt,
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