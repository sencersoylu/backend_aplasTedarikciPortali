const express = require('express');
const router = express.Router();
const db = require('../../models');

// tüm menüleri ilgili kullaniların yetkileriyle birlikte getirir
router.get('/user/:userID', function(req, res, next) {

    const id = req.params.userID;

    db.sequelize.query("SELECT m.genelMenuID, m.adi, m.genelMenuParentID, m.siraNo, IF(y.duzenleyebilir, true, false) as duzenleyebilir, IF(y.ekleyebilir, true, false) as ekleyebilir, IF(y.gorebilir, true, false) as gorebilir, IF(y.silebilir, true, false) as silebilir FROM genel_menu AS m LEFT JOIN kullanici_genel_menu_yetki AS y ON y.genelMenuID = m.genelMenuID AND y.kullaniciID = '" + id + "' ORDER BY genelMenuID", {
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

// kullanıcının yetkili olduğu menuler ve o menulerdeki yetkilerini getirir
router.get('/menu/user/:userID', function(req, res, next) {

    const id = req.params.userID;

    db.sequelize.query("SELECT m.genelMenuID, m.adi, m.genelMenuParentID, m.siraNo, m.path, m.iconName, IF ( y.duzenleyebilir, TRUE, FALSE ) AS duzenleyebilir, IF (y.ekleyebilir, TRUE, FALSE) AS ekleyebilir, IF (y.gorebilir, TRUE, FALSE) AS gorebilir, IF (y.silebilir, TRUE, FALSE) AS silebilir FROM kullanici_genel_menu_yetki AS y LEFT JOIN genel_menu AS m ON y.genelMenuID = m.genelMenuID WHERE y.kullaniciID = '" + id + "' ORDER BY genelMenuID", {
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

// kullanicinin yetkilerini günceller
router.put('/', async function(req, res, next) {

    const yetkiPersonelMenu = req.body;

    const menuIDs = yetkiPersonelMenu.menu;
    const yetkiler = {
        duzenleyebilir: yetkiPersonelMenu.yetki.duzenleyebilir,
        ekleyebilir: yetkiPersonelMenu.yetki.ekleyebilir,
        silebilir: yetkiPersonelMenu.yetki.silebilir,
        gorebilir: yetkiPersonelMenu.yetki.gorebilir,
    };
    const kullaniciID = yetkiPersonelMenu.kullanici;


    async function updateYetki(yetki) {
        return db.kullanici_genel_menu_yetki.update({
            ekleyebilir: yetkiler.ekleyebilir,
            silebilir: yetkiler.silebilir,
            duzenleyebilir: yetkiler.duzenleyebilir,
            gorebilir: yetkiler.gorebilir
        }, {
            where: {
                genelMenuID: yetki.genelMenuID,
				kullaniciID: kullaniciID
            }
        });
    }

    async function createYetki(id) {
        return db.kullanici_genel_menu_yetki.create({
            genelMenuID: id,
            kullaniciID: kullaniciID,
            ekleyebilir: yetkiler.ekleyebilir,
            silebilir: yetkiler.silebilir,
            duzenleyebilir: yetkiler.duzenleyebilir,
            gorebilir: yetkiler.gorebilir
        }, {
            raw: false
        });
    }

    db.sequelize.query("SELECT * FROM kullanici_genel_menu_yetki WHERE kullaniciID = '" + kullaniciID + "'", {
            type: db.Sequelize.QueryTypes.SELECT
        })
        .then(mevcutYetkiler => {
            if (mevcutYetkiler.length > 0) {

                const matchedYetkiler = mevcutYetkiler.filter(y => menuIDs.indexOf(y.genelMenuID) > -1);
                const newYetkiler = menuIDs.filter(id => mevcutYetkiler.map(yetki => yetki.genelMenuID).indexOf(id) == -1);
				
				// console.log("oncekiler: ",matchedYetkiler);
				// console.log("yeniler:", newYetkiler)

                Promise.all(matchedYetkiler.map(yetki => updateYetki(yetki)))
					.then(async()=> {
						// kullanicinin hiçbir yetkisi olmayan menuleri siliniyor
						
						try{
						await db.sequelize.query("DELETE FROM kullanici_genel_menu_yetki WHERE gorebilir = 0 AND silebilir = 0 AND duzenleyebilir = 0 AND ekleyebilir = 0 AND kullaniciID = '" + kullaniciID + "'" , {
							type: db.Sequelize.QueryTypes.DELETE
						});
						}	
						catch(err){
							console.log(err.message);
						}
					})
                    .then(() => {
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