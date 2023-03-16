const express = require('express');
const router = express.Router();
const db = require('../../models');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// duyuruya ait eklerin servisleri

router.get('/ekler/:duyuruID', function (req, res, next) {

	const id = req.params.duyuruID;

	db.sequelize.query("SELECT dosyaID, adi, turu FROM dosya WHERE dosyaID IN (SELECT dosyaID FROM duyuru_ekleri WHERE iletisimMerkeziDuyuruID = '" + id + "')", { type: db.Sequelize.QueryTypes.SELECT })
		.then(projeL => {
			res.json(projeL);
		})
		.catch(error => {
			res.status(400).json(error);
		});

});

router.get('/dosyaIcerik/:dosyaID', function (req, res, next) {

	const id = req.params.dosyaID;

	db.sequelize.query("SELECT * FROM dosya WHERE dosyaID = '" + id+ "'", { type: db.Sequelize.QueryTypes.SELECT })
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


router.post('/ekler/:duyuruID', upload.array('files', 12), (req, res, next) => {

	const files = req.files;
	const id = req.params.duyuruID;

	async function addDosyaRelation(dosya) {
		return db.dosya.create({
			adi: dosya.originalname,
			turu: dosya.mimetype,
			icerik: dosya.buffer
		}, { raw: false })
			.then((result) => db.sequelize.query("INSERT INTO duyuru_ekleri (dosyaID, iletisimMerkeziDuyuruID, createdAt, updatedAt) VALUES ( '" + result.dosyaID + "','" + id + "', NOW(), NOW())", { type: db.Sequelize.QueryTypes.INSERT }))

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


router.delete('/ekler/:id', async function (req, res, next) {

	try {
		const dosyaID = req.params.id;

		if (!dosyaID) return res.status(400).json("gecersiz dosya id");


		db.sequelize.query("DELETE FROM duyuru_ekleri WHERE dosyaID = '" + dosyaID+"'", { type: db.Sequelize.QueryTypes.DELETE })
			.then(() => db.sequelize.query("DELETE FROM dosya WHERE dosyaID = '" + dosyaID+"'", { type: db.Sequelize.QueryTypes.DELETE }))
			.then(result => {

				return res.json("OK");

			})
			.catch(err => {
				return res.status(400).json(err);
			})


	}
	catch (e) {
		console.log(e);
	}

});

//////////////////////


// const apUploader = require("../../helpers/apUploader");
// const apDownloader = require("../../helpers/apDownloader");

// // EK LİSTELEME İŞLEMİ
// router.post('/getList', async function (req, res) {

//     const filterData = req.body;
//     const parentID = req.body.userData.parentID;

//     if (!parentID) {
//         res.status(400).json("geçersiz plan id");
//     } else {

//         let rawQuery = "SELECT dosyaID, adi, turu, createdAt as yuklemeTarihi FROM dosya WHERE iliskiliTablo = 'iletisim_merkezi_duyuru' AND iliskiID = " + parentID + " ORDER BY createdAt DESC";

//         await crudHelper.getListR({
//             data: filterData,
//             rawQuery: rawQuery
//         }, (data, err) => {
//             if (data) {
//                 res.json(data);
//             }

//             if (err) {
//                 res.status(400).json(err);
//             }
//         });
//     }

// });

// // EK DOWNLOAD İŞLEMİ
// router.post('/DOWNLOAD', async function (req, res) {
//     try {
//         const id = +req.body.dosyaID;
//         const filePath = req.body.filePath;
//         const name = req.body.name;

//         if (filePath && name) {
//             res.download(filePath, name);
//         }
//         else if (id) {
//             let file = await apDownloader(id);
//             res.json(file);
//         } else {
//             throw "İndirme başlatılamadı!";
//         }

//     } catch (err) {
//         console.log(err);
//         res.status(400).json(err);
//     }
// });

// // EK UPLOAD İŞLEMİ
// router.post("/:talepID", async function (req, res) {
//     try {
//         const talepID = +req.params.talepID;

//         await apUploader({ req: req, iliskiliTablo: "iletisim_merkezi_duyuru", iliskiID: talepID });

//         res.json("İşlem başarıyla tamamlandı.");

//     } catch (err) {
//         console.log(err);
//         res.status(400).json(err);
//     }
// });


///////////////////////

module.exports = router;