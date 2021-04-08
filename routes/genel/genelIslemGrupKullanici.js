const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "genel_islem_grup_kullanici";
const keyExpr = "genelIslemGrupKullaniciID";
const parentKeyExpr = "genelIslemGrupID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = +req.body.userData.parentID;

    if (!parentID) {
        res.status(400).json("geçersiz sabit kıymet id");
    } else {

        let rawQuery = `
        SELECT g.${keyExpr}, k.kullaniciAdi, i.adi, i.soyadi FROM ( SELECT kullaniciID, ${keyExpr} FROM ${table} WHERE genelIslemGrupID = ${parentID} ) AS g LEFT JOIN kullanici AS k ON k.kullaniciUUID = g.kullaniciID LEFT JOIN genel_kisi AS i ON k.genelKisiID = i.genelKisiID ORDER BY g.${keyExpr} DESC
        `;

        await crudHelper.getListR({
            data: filterData,
            rawQuery: rawQuery
        }, (data, err) => {
            if (data) {
                res.status(201).json(data);
            }

            if (err) {
                res.status(400).json(err);
            }
        });
    }

});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
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

router.post('/update', async function (req, res) {

    const kullanicilar = await db.sequelize.query("select * from "+table+" WHERE "+parentKeyExpr+" = " + req.body.data[parentKeyExpr] + " AND kullaniciID = '" + req.body.data.kullaniciID + "' AND "+keyExpr+" != " + req.body.data[keyExpr] , {
        type: db.Sequelize.QueryTypes.SELECT
    })
    .catch(e => {
        console.error(e);
        return res.status(400).json("güncelleme sırasında hata oluştu");
    });

    if (kullanicilar.length > 0) {
        return res.status(400).json("grupta aynı kullanıcı zaten mevcut!!");
    }

    await crudHelper.updateR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            return res.status(201).json(data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });


});


router.post('/create', async function (req, res) {
    
    const kullanicilar = await db.sequelize.query("select * from "+table+" WHERE "+keyExpr+" = " + req.body.userData.parentID + " AND kullaniciID = '" + req.body.data.kullaniciID + "'", {
        type: db.Sequelize.QueryTypes.SELECT
    })
    .catch(e => {
        console.error(e);
        return res.status(400).json("güncelleme sırasında hata oluştu");
    });

    if (kullanicilar.length > 0) {
        return res.status(400).json("aynı işlem grubuna aynı kullanıcı tekrardan eklenemez!!");
    }

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

router.post('/delete', async function (req, res) {

    await crudHelper.deleteR({
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