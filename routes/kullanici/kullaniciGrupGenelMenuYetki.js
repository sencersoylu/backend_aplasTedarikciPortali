const express = require('express');
const router = express.Router();
const db = require('../../models');

// tüm menüleri ilgili kullani gruplarının yetkileriyle birlikte getirir
router.get('/kullaniciGrubu/:userID', function(req, res, next) {

    const id = req.params.userID;

    db.sequelize.query("SELECT m.genelMenuID, m.adi, m.genelMenuParentID, m.siraNo, IF(y.duzenleyebilir, true, false) as duzenleyebilir, IF(y.ekleyebilir, true, false) as ekleyebilir, IF(y.gorebilir, true, false) as gorebilir, IF(y.silebilir, true, false) as silebilir FROM genel_menu AS m LEFT JOIN kullanici_grup_genel_menu_yetki AS y ON y.genelMenuID = m.genelMenuID AND y.kullaniciGrupID = '" + id + "' ORDER BY genelMenuID", {
            type: db.Sequelize.QueryTypes.SELECT
        })
        .then(projeL => res.json({
            error: false,
            data: projeL
        }))
        .catch(error => res.json({
            error: true,
            data: [],
            error: error
        }));
});

router.put('/', async function(req, res, next) {

    const yetkiKullaniciGrupMenu = req.body;

    const menuIDs = yetkiKullaniciGrupMenu.menu;
    const yetkiler = {
        duzenleyebilir: yetkiKullaniciGrupMenu.yetki.duzenleyebilir,
        ekleyebilir: yetkiKullaniciGrupMenu.yetki.ekleyebilir,
        silebilir: yetkiKullaniciGrupMenu.yetki.silebilir,
        gorebilir: yetkiKullaniciGrupMenu.yetki.gorebilir,
    };
    const kullaniciGrupID = yetkiKullaniciGrupMenu.kullaniciGrup;


    async function updateYetki(yetki) {
        return db.kullanici_grup_genel_menu_yetki.update({
            ekleyebilir: yetkiler.ekleyebilir,
            silebilir: yetkiler.silebilir,
            duzenleyebilir: yetkiler.duzenleyebilir,
            gorebilir: yetkiler.gorebilir
        }, {
            where: {
                genelMenuID: yetki.genelMenuID,
				kullaniciGrupID: kullaniciGrupID
            }
        })
    }

    async function createYetki(id) {
        return db.kullanici_grup_genel_menu_yetki.create({
            genelMenuID: id,
            kullaniciGrupID: kullaniciGrupID,
            ekleyebilir: yetkiler.ekleyebilir,
            silebilir: yetkiler.silebilir,
            duzenleyebilir: yetkiler.duzenleyebilir,
            gorebilir: yetkiler.gorebilir
        }, {
            raw: false
        })
    }

    db.sequelize.query("SELECT * FROM kullanici_grup_genel_menu_yetki WHERE kullaniciGrupID = " + kullaniciGrupID, {
            type: db.Sequelize.QueryTypes.SELECT
        })
        .then( ( mevcutYetkiler )=> {
            if (mevcutYetkiler.length > 0) {

                const matchedYetkiler = mevcutYetkiler.filter(y => menuIDs.indexOf(y.genelMenuID) > -1);
                const newYetkiler = menuIDs.filter(id => mevcutYetkiler.map(yetki => yetki.genelMenuID).indexOf(id) == -1);
				
				 // console.log("oncekiler: ",matchedYetkiler);
				 // console.log("yeniler:", newYetkiler)

                Promise.all(matchedYetkiler.map(yetki => updateYetki(yetki)))
					.then(async ()=> {
						// console.log("1");
						try {
						// kullanici grubunun hiçbir yetkisi olmayan menuleri siliniyor
						await db.sequelize.query("DELETE FROM kullanici_grup_genel_menu_yetki WHERE gorebilir = 0 AND silebilir = 0 AND duzenleyebilir = 0 AND ekleyebilir = 0 AND kullaniciGrupID = " + kullaniciGrupID , {
							type: db.Sequelize.QueryTypes.DELETE
						})
						}
						catch (e) {
							console.log(e);
						}
					})
                    .then(() => {
						
						// console.log("2");
                        Promise.all(newYetkiler.map(id => createYetki(id)))
                            .then(x => {
                                res.status(201).json({
                                    error: false,
                                    data: x
                                })
                            })
                    })
                    .catch(err => {
                        console.log(err.message);
                        res.status(400).json(err);
                    });



            } else {

                Promise.all(menuIDs.map(id => createYetki(id)))
                    .then(x => {
                        res.status(201).json({
                            error: false,
                            data: x
                        })
                    })



            }
        })
        .catch(err => {
            console.log(err.message);
            res.status(400).json(err);
        });
});

module.exports = router;