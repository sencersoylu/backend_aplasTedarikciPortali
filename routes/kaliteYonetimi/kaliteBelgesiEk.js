const express = require('express');
const router = express.Router();
const db = require('../../models');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const table = "kalite_yonetimi_kalite_belgesi_ek";
const keyExpr = "kaliteYonetimiKaliteBelgesiEkID";
const parentKeyExpr = "kaliteYonetimiKaliteBelgesiID";

router.get('/', async function (req, res) {

    const parentID = req.query.id;

    if (!parentID) return res.status(400).json("gecersiz id");

    db.sequelize.query(`SELECT d.adi, d.turu, d.dosyaID FROM  ${table} as pf LEFT JOIN dosya as d ON d.dosyaID = pf.dosyaID WHERE pf.${parentKeyExpr} = '${parentID}'`, { type: db.Sequelize.QueryTypes.SELECT })
        .then(result => {
            res.json(result ? result : []);
        })
        .catch(err => {
            res.status(400).json(err);
        });

});

router.post('/', (req, res, next) => {

    const dokuman = req.body;

    db[table]
        .create(dokuman)
        .then((record) => {
            res.status(201).json(record);
        }).catch(err => {
            res.status(400).json(err);
        });

});

// surec dokuman dosyalarını ekler
router.post('/ekler/:formID', upload.array('files', 12), (req, res, next) => {

    const files = req.files;
    const id = req.params.formID;

    async function addDosyaRelation(dosya) {
        return db.dosya.create({
            adi: dosya.originalname,
            turu: dosya.mimetype,
            icerik: dosya.buffer
        }, { raw: false })
            .then(result => {
                return db[table].create({
                    dosyaID: result.dosyaID,
                    [parentKeyExpr]: id,
                }, { raw: false })
            });

    }

    Promise.all(files.map(dosya => addDosyaRelation(dosya)))
        .then((x) => {
            return res.status(201).json(x);
        })
        .catch(err => {
            console.log(err.message);
            res.status(400).json(err);
        });

});

router.get('/dosyaIcerik/:dosyaID', function (req, res, next) {

    const dosyaID = req.params.dosyaID;

    db.sequelize.query(`SELECT * FROM dosya WHERE dosyaID = '${dosyaID}'`, { type: db.Sequelize.QueryTypes.SELECT })
        .then(projeL => {
            const base64data = Buffer.from(projeL[0].icerik).toString('base64');

            res.json({
                content: base64data,
                type: projeL[0].turu, // mimetype
                name: projeL[0].adi
            });


        })
        .catch(error => {
            res.status(400).json(error);
        });

});

router.delete('/:id', async function (req, res) {

    try {
        const dosyaID = req.params.id;

        if (!dosyaID){
            return res.status(400).json("gecersiz dosya id");
        } 

        db.sequelize.query(`DELETE FROM ${table} WHERE dosyaID = '${dosyaID}'`, { type: db.Sequelize.QueryTypes.DELETE })
            .then(() => db.sequelize.query(`DELETE FROM dosya WHERE dosyaID = '${dosyaID}'`), { type: db.Sequelize.QueryTypes.DELETE })
            .then(() => {

                return res.json("OK")

            })
            .catch(err => {
                if (err.original.errno == 1451) {
                    return res.status(400).json("İlişkili kayıtları sildikten sonra silme işlemini deneyiniz!");
                } else {
                    return res.status(400).json(err);
                }


            })


    }
    catch (e) {
        console.log(e);
    }

});

module.exports = router;