const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');

const table = "urun_yonetimi_uretici_urun_urun_tasiyici";
const keyExpr = "urunYonetimiUreticiUrunUrunTasiyiciID";
const parentKeyExpr = "urunYonetimiUreticiUrunID";

router.post('/boxKesinSiparisDetay', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT t.varsayilanMi, birim.*, CONCAT('[ ',birim.kodu,' ] ', birim.adi) as koduAdi FROM ${table} as t LEFT JOIN genel_urun_tasiyici as birim ON birim.genelUrunTasiyiciID = t.genelUrunTasiyiciID WHERE t.urunYonetimiUreticiUrunID = ${filterData.urunID} ORDER BY kodu, adi ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.varsayilanMi, birim.*, CONCAT('[ ',birim.kodu,' ] ', birim.adi) as koduAdi FROM ${table} as t LEFT JOIN genel_urun_tasiyici as birim ON birim.genelUrunTasiyiciID = t.genelUrunTasiyiciID WHERE birim.genelUrunTasiyiciID = ${filterData.ID}`;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });


});

router.post('/getList', async function (req, res) {
   
    const filterData = req.body;
    const parentID = +filterData.userData.parentID;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT t.*, gut.kodu, gut.adi, tur.adi as turu FROM ${table} as t LEFT JOIN genel_urun_tasiyici as gut ON gut.genelUrunTasiyiciID = t.genelUrunTasiyiciID LEFT JOIN genel_urun_tasiyici_turu as tur ON tur.genelUrunTasiyiciTuruID = gut.genelUrunTasiyiciTuruID  WHERE t.${parentKeyExpr} = ${parentID} ORDER BY kodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT t.*, gut.kodu, gut.adi, tur.adi as turu  FROM ${table} as t LEFT JOIN genel_urun_tasiyici as gut ON gut.genelUrunTasiyiciID = t.genelUrunTasiyiciID WHERE ${keyExpr} = ${filterData.ID}`;
    }

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            res.json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                console.error(err)
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            res.status(200).json(data);
        }

        if (err) {
            console.error(err);
            res.status(400).json(err);
        }
    });

});

router.post('/update', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        await crudHelper.updateR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                console.error(err);
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        await crudHelper.deleteR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, (data, err) => {
            if (data) {
                res.status(200).json(data);
            }

            if (err) {
                res.status(400).json(err);
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

module.exports = router;