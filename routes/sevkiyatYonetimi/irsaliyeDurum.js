const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "sevkiyat_yonetimi_irsaliye_durum";
const keyExpr = "sevkiyatYonetimiIrsaliyeDurumID";

router.post('/boxIrsaliyeList', async function(req, res) {

    db.sequelize.query(`SELECT adi as durum FROM ${table} ORDER BY ${keyExpr} ASC`, { type: db.Sequelize.QueryTypes.SELECT })
    .then(d => {
        res.json(d);
    })
    .catch(e => {
        console.log(e);
        thres.status(400).json( "Sorgulama esnasında hata oluştu!");
    });


});

router.post('/boxIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table}`;
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