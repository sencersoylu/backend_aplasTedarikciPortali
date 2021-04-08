const express = require('express');
const router = express.Router();
const db = require('../../models');

// tüm operasyonları ilgili kullanici gruplarının yetkileriyle birlikte getirir
router.post('/get', function (req, res, next) {

    const id = req.body.userData.kullaniciGrupID;
    if (!id) {
        res.status(400).json({ validationError: 'kullanıcı grup boş olmamalı' });
        return;
    }

    db.sequelize.query("SELECT m.operasyonID, m.adi, IF(y.durum, true, false) as durum FROM operasyon AS m LEFT JOIN operasyon_kullanici_grup_yetki AS y ON y.operasyonID = m.operasyonID AND y.kullaniciGrupID = " + id + " ORDER BY operasyonID", {
        type: db.Sequelize.QueryTypes.SELECT
    })
        .then(projeL => res.json(projeL))
        .catch(error => res.status(400).json(error));

});

router.post('/update', async function (req, res, next) {

    try {
        const data = req.body;

        const operasyonID = data.operasyonID;
        const durum = data.durum;
        const kullaniciGrupID = data.kullaniciGrupID;

        const mevcutYetkiler = await db.sequelize.query("SELECT * FROM operasyon_kullanici_grup_yetki WHERE kullaniciGrupID = :kullaniciGrupID AND operasyonID = :operasyonID", {
            type: db.Sequelize.QueryTypes.SELECT,
            replacements: {
                kullaniciGrupID: kullaniciGrupID,
                operasyonID: operasyonID
            }
        })

        if (mevcutYetkiler.length == 1) {

            await db.operasyon_kullanici_grup_yetki.update({
                durum: durum
            }, {
                where: {
                    operasyonKullaniciGrupYetkiID: mevcutYetkiler[0].operasyonKullaniciGrupYetkiID
                }
            })

            return res.json("OK");

        } 
        else if(mevcutYetkiler.length > 1){

            res.status(400).json({validationError: 'birden fazla yetki bulunmakta!'});
            return;
            
        }
        else {

            await db.operasyon_kullanici_grup_yetki.create({
                operasyonID: operasyonID,
                kullaniciGrupID: kullaniciGrupID,
                durum: durum
            })

            return res.status(201).json("OK");

        }

    }
    catch (err) {
        console.log(err.message);
        res.status(400).json(err);
    };
});

module.exports = router;