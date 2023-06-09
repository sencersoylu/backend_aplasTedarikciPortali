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

    let rawQuery = "SELECT t.*, CONCAT('[ ',gob.kodu,' ] ', gob.adi) as olcuBirimi, gu.adi as mensei FROM " + table + " as t LEFT JOIN genel_olcu_birimi as gob ON gob.genelOlcuBirimiID = t.genelOlcuBirimiID LEFT JOIN genel_ulke as gu ON gu.genelUlkeID = t.genelUlkeID WHERE t." + parentKeyExpr + " = '" + parentID + "'";

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

router.post('/update', async function (req, res) {

    try {

        const irsaliyeID = req.body.data[parentKeyExpr];
        const firmaTurID = req.body.userData.userFirmaTurID;

        if (firmaTurID == 1) {
            throw "sadece tedarikçi firma düzenleme yapabilir!";
        }

        const irsaliyeDurum = (await db.sequelize.query(`
        
        SELECT sevkiyatYonetimiIrsaliyeDurumID as durumID
        FROM sevkiyat_yonetimi_irsaliye 
        WHERE ${parentKeyExpr} = '${irsaliyeID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];



        if (irsaliyeDurum) {
            if (irsaliyeDurum['durumID'] == 2) {
                throw "alıcıya gönderilmiş irsaliyenin detayı güncellenemez!";
            }
        }
        else {
            throw "aranan irsaliye kaydı bulunamadı!";
        }

        const sevkMiktari = req.body.data['miktar'] ? Number(req.body.data['miktar']) : 0;
        req.body.data['miktar'] = sevkMiktari;

        await crudHelper.updateR({
            body: req.body,
            table: table,
            keyExpr: keyExpr,
            parentKeyExpr: parentKeyExpr
        }, (data, err) => {
            if (data) {

                return res.json("OK");

            }

            if (err) {
                return res.status(400).json(err);
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json(err);
    }

});

module.exports = router;