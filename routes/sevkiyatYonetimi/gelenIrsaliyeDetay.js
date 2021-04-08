const express = require('express');
const router = express.Router();
const db = require('../../models');

const table = "sevkiyat_yonetimi_irsaliye_detay";
const keyExpr = "sevkiyatYonetimiIrsaliyeDetayID";
const parentKeyExpr = "sevkiyatYonetimiIrsaliyeID";

const crudHelper = require('../../helpers/crudHelper');

router.post('/getList', async function (req, res) {

    const filterData = req.body;
    const parentID = filterData.userData.parentID;

    if (!parentID) {
        return res.status(400).json({
            validationError: "parent id boş olamaz!"
        });
    }

    let rawQuery = "SELECT t.*, tedUrun.kodu as tedarikciUrunuKod, tedUrun.adi as tedarikciUrunuAd, CONCAT('[ ',gob.kodu,' ] ', gob.adi) as olcuBirimi, gpb.ad as paraBirimi FROM " + table + " as t LEFT JOIN urun_yonetimi_tedarikci_urun as tedUrun ON tedUrun.urunYonetimiTedarikciUrunID = t.tedarikciUrunID LEFT JOIN genel_olcu_birimi as gob ON gob.genelOlcuBirimiID = t.genelOlcuBirimiID LEFT JOIN genel_para_birimi as gpb ON gpb.genelParaBirimiID = t.genelParaBirimiID WHERE t." + parentKeyExpr + " = " + parentID;

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (data, err) => {
        if (data) {
            return res.status(201).json(filterData.ID ? data.data[0] : data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });


});

router.post('/get', async function (req, res) {

    await crudHelper.getR({
        body: req.body,
        table: table,
        keyExpr: keyExpr
    }, (data, err) => {
        if (data) {
            return res.status(201).json(data);
        }

        if (err) {
            return res.status(400).json(err);
        }
    });

});

module.exports = router;