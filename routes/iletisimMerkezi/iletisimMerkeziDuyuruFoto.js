const express = require('express');
const router = express.Router();
const db = require('../../models');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// duyuruya ait fotonun servisleri
router.get('/:duyuruID/images', async function (req, res) {

	try {
		const lokID = +req.params.duyuruID;

		if (!lokID) return res.status(400).json("gecersiz dosya id");

		db.sequelize.query("SELECT d.* FROM dosya as d LEFT JOIN duyuru_fotolari as pf ON d.dosyaID = pf.dosyaID WHERE pf.iletisimMerkeziDuyuruID = " + lokID, { type: db.Sequelize.QueryTypes.SELECT })
			.then(result => {
				res.json(result.map(d => {
					d.icerik = Buffer.from(d.icerik).toString('base64');
					return d;
				}))
			})
			.catch(error => {
				res.status(400).error(error);
			});


	} catch (e) {
		console.log(e);
	}

});

router.get('/:duyuruID/images/:id', async function (req, res) {

	const id = +req.params.id;
	const lokID = +req.params.duyuruID;

	if (!lokID) return res.status(400).json("gecersiz duyuru id");

	if (!id) return res.status(400).json("gecersiz dosya id");

	db.sequelize.query("SELECT d.adi, d.turu, d.dosyaID FROM dosya as d LEFT JOIN duyuru_fotolari as pf ON d.dosyaID = pf.dosyaID AND pf.iletisimMerkeziDuyuruID = " + lokID + " WHERE d.dosyaID = " + id, { type: db.Sequelize.QueryTypes.SELECT })
		.then(result => {
			res.json(result);
		})
		.catch(error => {
			res.status(400).json(error);
		});

});


router.post('/:duyuruID/images', upload.array('files', 12), (req, res, next) => {

	const files = req.files;
	const id = +req.params.duyuruID;

	async function addDosyaRelation(dosya) {
		return db.dosya.create({
			adi: dosya.originalname,
			turu: dosya.mimetype,
			icerik: dosya.buffer
		}, { raw: false })
			//		return db.sequelize.query("INSERT INTO dosya (adi,turu,icerik) VALUES ('"+ dosya.originalname + "','" +dosya.mimetype + "','" + dosya.buffer +"')", { type: db.Sequelize.QueryTypes.INSERT })
			.then((result) => db.sequelize.query("INSERT INTO duyuru_fotolari (dosyaID, iletisimMerkeziDuyuruID, createdAt, updatedAt) VALUES ( " + result.dosyaID + "," + id + ", NOW(), NOW())", { type: db.Sequelize.QueryTypes.INSERT }))

	}

	Promise.all(files.map(dosya => addDosyaRelation(dosya)))
		.then((x) => {
			res.status(201).json(x);
		})
		.catch(err => {
			console.log(err.message);
			res.status(400).json(err);
		});

});

router.delete('/images/:id', async function (req, res, next) {

	try {
		const dosyaID = +req.params.id;

		if (!dosyaID) return res.status(400).json("gecersiz dosya id");


		db.sequelize.query("DELETE FROM duyuru_fotolari WHERE dosyaID = " + dosyaID, { type: db.Sequelize.QueryTypes.DELETE })
			.then(() => db.sequelize.query("DELETE FROM dosya WHERE dosyaID = " + dosyaID, { type: db.Sequelize.QueryTypes.DELETE }))
			.then(result => {

				res.json("OK");


			})
			.catch(err => {
				return res.status(400).json(err);
			})


	}
	catch (e) {
		console.log(e);
	}

});

module.exports = router;