const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "kullanici_firma";
const keyExpr = "kullaniciFirmaID";

router.post('/boxIrsaliye', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT t.* FROM ${table} as t ORDER BY t.firmaKodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.* FROM ${table} as t WHERE t.${keyExpr} = '${filterData.ID}'`;
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
        rawQuery = `SELECT t.* FROM ${table} as t ORDER BY t.firmaKodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.* FROM ${table} as t WHERE t.${keyExpr} = '${filterData.ID}'`;
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

router.post('/getList', async function (req, res) {
    console.log(`post request => ${req.originalUrl}`);

    const filterData = req.body;

    let rawQuery = `SELECT t.* FROM ${table}  as t ORDER BY t.createdAt DESC`;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            console.error(err)
            res.status(400).json(err);
        }
    });

});

router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        if (!data["firmaAdi"]) {
            throw "'Firma Adı' boş olamaz!";
        }

        if (!data["firmaKodu"]) {
            throw "'Firma Kodu' boş olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }));

        if(oldRecord.length > 0){
            throw "tek bir kullanıcı firma eklenebilir!"
        }

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/update', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        if (!data["firmaAdi"]) {
            throw "'Firma Adı' boş olamaz!";
        }

        if (!data["firmaKodu"]) {
            throw "'Firma Kodu' boş olamaz!";
        }

        await crudHelper.updateR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});


router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.status(200).json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

module.exports = router;