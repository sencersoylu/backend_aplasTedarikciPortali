const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');
const fs = require('fs');

const table = "sevkiyat_yonetimi_irsaliye";
const keyExpr = "sevkiyatYonetimiIrsaliyeID";

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const userFirmaID = +filterData.userData.userFirmaID;
        const userFirmaTurID = +filterData.userData.userFirmaTurID;

        // üretci firma
        let rawQuery =
            `
SELECT
	t.*, t.createdAt AS dokumanTarihi,
	durum.adi AS durumu
FROM
    ${table} AS t
LEFT JOIN sevkiyat_yonetimi_irsaliye_durum AS durum ON durum.sevkiyatYonetimiIrsaliyeDurumID = t.sevkiyatYonetimiIrsaliyeDurumID
WHERE
	t.ureticiFirmaID = ${userFirmaID}
    ${userFirmaTurID == 1 ? 'AND t.sevkiyatYonetimiIrsaliyeDurumID > 1' : ''} 
ORDER BY
	t.${keyExpr} DESC
        
        `;

        await crudHelper.getListR({
            data: filterData,
            rawQuery: rawQuery
        }, (data, err) => {
            if (data) {
                res.json(data);
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

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table} WHERE ${keyExpr} = ${data[keyExpr]}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {


            if (oldRecord['sevkiyatYonetimiIrsaliyeDurumID'] == 2) {
                throw "Onaylanmış irsaliye güncellenemez!";
            }

            await crudHelper.updateR({
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

        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const id = req.body.ID;

        const irsDurum = (await db.sequelize.query(`SELECT t.sevkiyatYonetimiIrsaliyeDurumID as durumID FROM ${table} as t WHERE t.${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (irsDurum) {
            if (irsDurum.durumID != 1) {
                throw "sadece taslak irsaliyeler silinebilir";
            }
            else {

                await db.sequelize.query(`DELETE FROM sevkiyat_yonetimi_irsaliye_detay WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.DELETE })
                    .catch(e => {
                        console.log(e);
                        throw "Detay silme işlemi esnasında hata oluştu!";
                    })

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
            }
        }
        else {
            throw "aranan kayıt bulunamadı!";
        }

    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

router.post('/getEtiket', async function (req, res) {

    const filterData = req.body;

    let irsaliyeDetayID = filterData.id;
    if (!irsaliyeDetayID) {
        res.status(400).json({ validationError: " irsaliye detay id boş olamaz!" });
        return;
    }

    let rawQuery = "SELECT 'testStokNo' as stokNo, 'testStokNo' as stokNoBarcodeValue, 'testTedarikçiÜrünKodu' as resimNo, 'testUrunAdi' as tanim, 'testLotNo' as lotNo, 'testLotNo' as lotNoBarcodeValue, 'testTedarikçiFirmaAdi' as firma, '08.04.2021' as tarih, 'testIrsaliyeNo' as irsaliyeNo";

    await crudHelper.getListR({
        data: filterData,
        rawQuery: rawQuery
    }, (resp, err) => {
        if (resp) {
            let respData = resp.data.length > 0 ? resp.data[0] : null;

            if (!respData) {
                res.status(400).json({ validationError: 'kayıt bulunamadı!' });
                return;
            }

            let filePath = "assets/etiket-tasarim/kasaEtiketi.html";

            fs.readFile(filePath, "UTF8", (err, design) => {
                if (err) {
                    res.status(400).json({ validationError: 'Etiket oluşturulurken hata ile karşılaşıldı' });
                    return;
                }

                if (design) {

                    res.json({
                        data: respData,
                        design: design
                    });
                }


            });

        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

module.exports = router;