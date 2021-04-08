const express = require('express');
const router = express.Router();
const db = require('../../models');

const tableName = "genel_menu";
const tableIDField = "genelMenuID";

// tüm genel menüleri getirir
router.get('/', function(req, res, next) {

    db.sequelize.query(
            "select * from genel_menu order by siraNo asc, genelMenuID asc", {
                type: db.Sequelize.QueryTypes.SELECT
            })
        .then(projeL => res.json({
            error: false,
            data: projeL
        }))
        .catch(error => res.json({
            data: [],
            error: error
        }));
});

router.get('/:id', async function(req, res) {


    const id = +req.params.id;

    if (!id) {
        res.status(400).json("gecersiz id");
    }

    db[tableName].findOne({
            where: {
                [tableIDField]: id
            },
            raw: true
        })
        .then(r => {
            res.json(r);
        })
        .catch(e => {
            res.status(400).json(e);
        });


});


router.put('/', async function(req, res, next) {

    const tanim = req.body;
    delete tanim['createdAt'];

    db[tableName].update(
            tanim, {
                where: {
                    [tableIDField]: tanim[tableIDField]
                }
            }
        )
        .then(() => {
            res.json("OK");
        })
        .catch(e => {
            res.status(400).json(e);
        });


});

router.post('/siralama', async(req, res) => {

    const menuSiralamalari = req.body.siralama;

    async function updateMenuOrder(detay) {
        return db[tableName]
            .update({
                siraNo: detay.siraNo,
                genelMenuParentID: detay.genelMenuParentID
            }, {
                where: {
                    [tableIDField]: detay.genelMenuID
                }
            })
    }


    Promise.all(menuSiralamalari.map(menuSira => {
            return updateMenuOrder(menuSira);
        }))
        .then(() => {
            res.json("OK");
        })
        .catch(e => {
            res.status(400).json(e);
        });




});


router.post('/', (req, res, next) => {

    const tanim = req.body;

    db[tableName]
        .create(tanim)
        .then((record) => {

            res.json(record);

        }).catch(err => {
            res.status(400).json(err);
        })
});

router.delete('/:id', async function(req, res, next) {

    const id = req.params.id;

    if (!id) {
        res.status(400).json("gecersiz id");
    }

    const deletedRecord = await db[tableName].findOne({
        where: {
            [tableIDField]: id
        },
        raw: true
    })

    if (!deletedRecord) {
        res.status(400).json("kayıt bulunamadi");
    }

    db[tableName].destroy({
            where: {
                [tableIDField]: id
            }
        })
        .then(() => {
            res.json("OK");
        })
        .catch(err => {
            if (err.original.errno == 1451) {
                res.status(400).json("İlişkili kayıtları sildikten sonra silme işlemini deneyiniz!");
            } else {
                res.status(400).json(err);
            }

        });

});

module.exports = router;