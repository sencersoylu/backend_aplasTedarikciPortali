const express = require('express');
const router = express.Router();

const table = "genel_urun_tasiyici_turu";
const keyExpr = "genelUrunTasiyiciTuruID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/boxGenelUrunTasiyici', async function(req, res) {

    const filterData = req.body;

    let rawQuery;

    if (!filterData.ID) { // liste
        rawQuery = `SELECT *, CONCAT('[ ',kodu,' ] ', adi) as koduAdi FROM ${table} ORDER BY kodu ASC`;
    } else { // tek kayıt
        rawQuery = `SELECT *, CONCAT('[ ',kodu,' ] ', adi) as koduAdi FROM ${table} WHERE ${keyExpr} = '${filterData.ID}'`;
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

module.exports = router;
