const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "kullanici_grup_kullanici";
const keyExpr = "kullaniciGrupKullaniciID";
const parentKeyExpr = "kullaniciGrupID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = req.body.userData.parentID;

    if (!parentID) {
        res.status(400).json("geçersiz kullanıcı grup id");
    } else {

        let rawQuery = `SELECT g.kullaniciGrupKullaniciID, k.kullaniciAdi, k.kisiAdi as adi, k.kisiSoyadi as soyadi FROM kullanici_grup_kullanici as g LEFT JOIN kullanici AS k ON k.kullaniciID = g.kullaniciID WHERE g.kullaniciGrupID = '${parentID}' ORDER BY g.createdAt DESC`;

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

    const kullanicilar = await db.sequelize.query("select * from kullanici_grup_kullanici WHERE kullaniciGrupID = :grupID AND kullaniciID = :kullaniciID AND kullaniciGrupKullaniciID != :kullaniciGrupID" , {
        type: db.Sequelize.QueryTypes.SELECT,
        replacements: {
            grupID: req.body.data.kullaniciGrupID,
            kullaniciID: req.body.data.kullaniciID,
            kullaniciGrupID: req.body.data.kullaniciGrupKullaniciID
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
    
    const kullanicilar = await db.sequelize.query("select * from kullanici_grup_kullanici WHERE kullaniciGrupID = :grupID AND kullaniciID = :kullaniciID", {
        type: db.Sequelize.QueryTypes.SELECT,
        replacements: {
            grupID: req.body.userData.parentID,
            kullaniciID: req.body.data.kullaniciID
        }
    })
    .catch(e => {
        console.error(e);
        return res.status(400).json("güncelleme sırasında hata oluştu");
    });

    if (kullanicilar.length > 0) {
        return res.status(400).json("aynı kullanıcı grubuna aynı kullanıcı tekrardan eklenemez!!");
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
            res.status(201).json(data);
        }

        if (err) {
            console.error(err);
            if (err.original.errno == 1451) {
                res.status(400).json("İlişkili kayıtları sildikten sonra silme işlemini deneyiniz!");
            } else {
                res.status(400).json(err);
            }
        }
    });

});

module.exports = router;