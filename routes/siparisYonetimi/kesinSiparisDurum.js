const { filter } = require('async');
const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');

const table = "siparis_yonetimi_kesin_siparis_durum";
const keyExpr = "siparisYonetimiKesinSiparisDurumID";

router.post('/boxGidenKesinSiparis', async function(req, res) {

    const filterData = req.body;
    const userFirmaTurID =  filterData.userData.userFirmaTurID;

    let durumlar;

    if(userFirmaTurID == 1){ // üretici firma
        durumlar = "1,2,7,8,9,10,11";
    }
    else if(userFirmaTurID == 2){ // tedarikçi firma
        durumlar = "3,4,5,6"
    }
    else{
        durumlar = "1,2,3,4,5,6,7,8,9,10,11"
    }

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} IN (${durumlar})`;
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

router.post('/boxGelenKesinSiparis', async function(req, res) {

    const filterData = req.body;
    const userFirmaTurID =  filterData.userData.userFirmaTurID;

    let durumlar;

    if(userFirmaTurID == 1){ // üretici firma
        durumlar = "2,7,8,9,10,11";
    }
    else if(userFirmaTurID == 2){ // tedarikçi firma
        durumlar = "3,4,5,6";
    }
    else{
        durumlar = "1,2,3,4,5,6,7,8,9,10,11";
    }

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} WHERE ${keyExpr} IN (${durumlar}) `;
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

router.post('/boxKesinSiparis', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT * FROM ${table} `;
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