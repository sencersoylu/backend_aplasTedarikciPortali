const express = require('express');
const router = express.Router();

const table = "genel_urun_tasima_turu";
const keyExpr = "genelUrunTasimaTuruID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/boxIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table}`;
    } else { // tek kayıt
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} = '${filterData.ID}'`;
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

router.post('/boxSiparistenIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table}`;
    } else { // tek kayıt
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} = '${filterData.ID}'`;
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
