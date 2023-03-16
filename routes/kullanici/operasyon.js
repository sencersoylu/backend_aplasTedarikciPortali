const express = require('express');
const router = express.Router();
const db = require('../../models');

// tüm operasyonları ilgili kullanici gruplarının yetkileriyle birlikte getirir
router.post('/yetkiSorgula', async function (req, res, next) {

    const userID = req.body.userData.userID;
    const operasyonID = req.body.ID;

    if (!userID) {
        res.status(400).json({ validationError: 'user boş olmamalı' });
        return;
    }

    try {

        const yetkiler = await db.sequelize.query("SELECT IF(MAX(yetki.durum), true, false) as durum FROM operasyon_kullanici_grup_yetki AS yetki LEFT JOIN kullanici_grup_kullanici AS grupKullanici ON grupKullanici.kullaniciGrupID = yetki.kullaniciGrupID WHERE grupKullanici.kullaniciID = :userID AND yetki.operasyonID = :id GROUP BY yetki.operasyonID", {
            type: db.Sequelize.QueryTypes.SELECT, 
            replacements: {
                userID: userID,
                id: operasyonID
            }
        })
 
        let status = yetkiler.length == 0 ? false : yetkiler[0].durum == 0 ? false : true;
        res.json(status);

    } catch (err) {
        res.status(400).json(err);

    }

});

module.exports = router;