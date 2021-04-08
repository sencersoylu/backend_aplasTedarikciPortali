const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "kullanici_grup";
const keyExpr = "kullaniciGrupID";

router.post('/boxOperasyonYetki', async function (req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = "SELECT * FROM " + table + " ORDER BY adi ASC";
    } else { // tek kayıt
        rawQuery = "SELECT * FROM " + table + " WHERE " + keyExpr + " = " + filterData.ID;
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

router.get('/', async function (req, res) {

    db.sequelize.query("SELECT * FROM " + table + " ORDER BY adi ASC", { type: db.Sequelize.QueryTypes.SELECT })
        .then(data => {
            res.json(data);
        })
        .catch(e => {
            console.error(e);
            res.status(400).json("kullanıcı grup listesine erişilirken hatayla karşılaşıldı!");
        });

});

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;

        let rawQuery = `SELECT * FROM ${table} ORDER BY ${keyExpr} DESC`;

        await crudHelper.getListR({
            data: filterData,
            rawQuery: rawQuery
        }, (data, err) => {
            if (data) {
                res.json(data);
            }

            if (err) {
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
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
                console.error(err)
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
            console.error(err);
            res.status(400).json(err);
        }
    });

});

router.post('/update', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
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
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    console.log(`post request => ${req.originalUrl}`);

    await crudHelper.deleteR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            return res.status(200).json(data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });

});

module.exports = router;