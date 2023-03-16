const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "genel_islem_grup_kullanici";
const keyExpr = "genelIslemGrupKullaniciID";
const parentKeyExpr = "genelIslemGrupID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = req.body.userData.parentID;

    if (!parentID) {
        res.status(400).json("geçersiz işlem grup id");
    } else {

        let rawQuery = `
        SELECT g.${keyExpr}, k.kullaniciAdi, k.kisiAdi as adi, k.kisiSoyadi as soyadi FROM ( SELECT kullaniciID, ${keyExpr} FROM ${table} WHERE genelIslemGrupID = '${parentID}' ) AS g LEFT JOIN kullanici AS k ON k.kullaniciID = g.kullaniciID ORDER BY g.createdAt DESC
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

    const kullanicilar = await db.sequelize.query("select * from "+table+" WHERE "+parentKeyExpr+" = :parentID AND kullaniciID = :kullaniciID AND "+keyExpr+" != :id" , {
        type: db.Sequelize.QueryTypes.SELECT,
        replacements: {
            parentID: req.body.data[parentKeyExpr],
            kullaniciID: req.body.data.kullaniciID,
            id: req.body.data[keyExpr]
        }
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
    
    const kullanicilar = await db.sequelize.query("select * from "+table+" WHERE "+keyExpr+" = :parentID AND kullaniciID = :kullaniciID", {
        type: db.Sequelize.QueryTypes.SELECT,
        replacements: {
            parentID: req.body.userData.parentID,
            kullaniciID:  req.body.data.kullaniciID
        }
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