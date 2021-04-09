const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "iletisim_merkezi_duyuru";
const keyExpr = "iletisimMerkeziDuyuruID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function(req, res) {

    const filterData = req.body;

    let rawQuery = `SELECT t.* FROM ${table} as t ORDER BY t.${keyExpr} DESC`;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

router.post('/get', async function(req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});


router.post('/update', async function(req, res) {

    await crudHelper.updateR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.json(data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});


router.post('/create', async function(req, res) {

    await crudHelper.createR({
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

router.post('/delete', async function(req, res) {

	try {
		const {
			id
		} = req.params;

		if (!id) return res.status(400).json("gecersiz dosya id");

		const willBeDeleted = await db.iletisim_merkezi_duyuru.findOne({
			where: {
				iletisimMerkeziDuyuruID: id
			},
			raw: true
		});

		if (!willBeDeleted) return res.status(400).json("duyuru bulunamadi");

		db.sequelize.query("DELETE FROM dosya WHERE dosyaID IN (SELECT dosyaID FROM duyuru_fotolari WHERE iletisimMerkeziDuyuruID = " + id + ")", { type: db.Sequelize.QueryTypes.DELETE })
			.then(() => db.sequelize.query("DELETE FROM duyuru_fotolari WHERE iletisimMerkeziDuyuruID = " + id, { type: db.Sequelize.QueryTypes.DELETE }))
			.then(() => db.sequelize.query("DELETE FROM dosya WHERE dosyaID IN (SELECT dosyaID FROM duyuru_ekleri WHERE iletisimMerkeziDuyuruID = " + id + ")", { type: db.Sequelize.QueryTypes.DELETE }))
			.then(() => db.sequelize.query("DELETE FROM duyuru_ekleri WHERE iletisimMerkeziDuyuruID = " + id, { type: db.Sequelize.QueryTypes.DELETE }))
			.then(() => {
				db.iletisim_merkezi_duyuru.destroy({
					where: {
						iletisimMerkeziDuyuruID: id
					}

				})
					.then(() => {

						return res.json("OK");
					})
					.catch(err => {
						return res.status(400).json(err);
					})
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