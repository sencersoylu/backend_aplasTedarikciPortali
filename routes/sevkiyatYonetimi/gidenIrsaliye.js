const { filter } = require('async');
const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "sevkiyat_yonetimi_irsaliye";
const keyExpr = "sevkiyatYonetimiIrsaliyeID";

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const userFirmaID = +filterData.userData.userFirmaID;

        // tedarikci firma
        let rawQuery =
            `
SELECT
	t.*, t.createdAt AS dokumanTarihi,
	durum.adi AS durumu,
	tedarikciFirma.firmaAdi AS tedarikciFirma,
	ureticiFirma.firmaAdi AS ureticiFirma,
	uretAdres.adres AS varisYeri,
	tedAdres.adres AS cikisYeri
FROM
    ${table} AS t
LEFT JOIN genel_firma AS tedarikciFirma ON tedarikciFirma.genelFirmaID = t.tedarikciFirmaID
LEFT JOIN genel_firma AS ureticiFirma ON ureticiFirma.genelFirmaID = t.ureticiFirmaID
LEFT JOIN genel_firma_adres AS tedAdres ON tedAdres.genelFirmaAdresID = t.cikisAdresiID
LEFT JOIN genel_firma_adres AS uretAdres ON uretAdres.genelFirmaAdresID = t.varisAdresiID
LEFT JOIN sevkiyat_yonetimi_irsaliye_durum AS durum ON durum.sevkiyatYonetimiIrsaliyeDurumID = t.sevkiyatYonetimiIrsaliyeDurumID
WHERE
	t.tedarikciFirmaID = ${userFirmaID}
    AND t.tedarikciyeGorunsunMu = 1
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

// router.post('/create', async function (req, res) {
//     try {
//         console.log(`post request => ${req.originalUrl}`);

//         let body = req.body;
//         let data = body["data"];

//         if (!data) {
//             throw "Data boş olamaz!";
//         }

//         if (data['sevkiyatYonetimiIrsaliyeDurumID'] == 3) {
//             throw "Yeni oluşturulan irsaliye, doğrudan iptal edilemez!";
//         }

//         await crudHelper.createR({
//             body: req.body,
//             table: table,
//             keyExpr: keyExpr
//         }, (data, err) => {
//             if (data) {
//                 res.status(200).json(data);
//             }

//             if (err) {
//                 console.error(err)
//                 res.status(400).json(err);
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(400).json(err);
//     }
// });

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
        let userData = body['userData'];

        if (!data) {
            throw "Data boş olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT * FROM ${table} WHERE ${keyExpr} = ${data[keyExpr]}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {

            if (!!oldRecord['sonrakiIrsaliyeID']) {
                throw "revizyona uğramış döküman güncellenemez!";
            }

            if (oldRecord['sevkiyatYonetimiIrsaliyeDurumID'] > 1) {
                throw "sadece taslak halindeki irsaliye güncellenebilir!";
            }

            // durum değişikliği varsa yeni irsaliye dökümanı oluşturuluyor
            if (oldRecord['sevkiyatYonetimiIrsaliyeDurumID'] != data['sevkiyatYonetimiIrsaliyeDurumID']) {

                const oldID = oldRecord[keyExpr];
                const oldDurumID = oldRecord['sevkiyatYonetimiIrsaliyeDurumID'];
                const oldNot = oldRecord['not'];

                delete oldRecord[keyExpr];
                delete oldRecord['createdUserID'];
                delete oldRecord['updatedUserID'];
                delete oldRecord['createdAt'];
                delete oldRecord['updatedAt'];

                oldRecord['createdUserID'] = userData.userID;
                oldRecord['sevkiyatYonetimiIrsaliyeDurumID'] = data['sevkiyatYonetimiIrsaliyeDurumID'];
                oldRecord['not'] = data['not'];

                const newRecord = await db[table].create(oldRecord).catch(e => {
                    console.log(e);
                    throw "irsaliye dökümanı oluşturulurken hatayla karşılaşıldı!"
                });

                const newID = newRecord[keyExpr];
                console.log("****************:", newID)

                const oldIrsaliyeKalemleri = await db.sequelize.query(`SELECT * FROM sevkiyat_yonetimi_irsaliye_detay WHERE ${keyExpr} = ${oldID}`, { type: db.Sequelize.QueryTypes.SELECT })
                    .catch(e => {
                        console.log(e);
                        throw "Detay Sorgulaması esnasında hata oluştu!";
                    });

                if (oldIrsaliyeKalemleri.length > 0) {

                    const newKalemler = oldIrsaliyeKalemleri.map(t => {
                        delete t['createdUserID'];
                        delete t['updatedUserID'];
                        delete t['createdAt'];
                        delete t['updatedAt'];
                        delete t[keyExpr];
                        delete t['sevkiyatYonetimiIrsaliyeDetayID'];

                        t['createdUserID'] = userData.userID;
                        t[keyExpr] = newID;

                        return t;
                    });

                    await db['sevkiyat_yonetimi_irsaliye_detay'].bulkCreate(newKalemler)
                        .catch(e => {
                            console.log(e);
                            throw "irsaliye dökümanındaki detayları oluştururken hatayla karşılaşıldı!"
                        });

                }

                req.body.data['sonrakiIrsaliyeID'] = newRecord[keyExpr];
                req.body.data['sevkiyatYonetimiIrsaliyeDurumID'] = oldDurumID;
                req.body.data['not'] = oldNot;

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
            else {

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

        await db.sequelize.query(`UPDATE ${table} SET tedarikciyeGorunsunMu = 0 WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.UPDATE })
            .then(() => {
                return res.json(true);
            })
            .catch(e => {
                console.log(e);
                throw "Çöp kutusuna atma esnasında hata oluştu!";
            });

    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }

});

router.post('/getKasaEtiketi', async function (req, res) {

    const filterData = req.body;

    let irsaliyeDetayID = filterData.id;
    if (!irsaliyeDetayID) {
        res.status(400).json({ validationError: " irsaliye detay id boş olamaz!" });
        return;
    }

    let rawQuery = "SELECT *, CONCAT( tipAdi, '\n\r', kasaNo, '\n\r', kasalanmaZamani, '\n\r', DATE_FORMAT( DATE_ADD(NOW(),INTERVAL 3 HOUR), '%d.%m.%Y %H:%i' ) ) AS barcodValue FROM ( SELECT 2000804 AS companyCode, 'A-PLAS' AS companyName, CONVERT(SUBSTRING(k.kasaNo, 7, 4),UNSIGNED INTEGER) AS kasaNo, DATE_FORMAT( DATE_ADD(k.createdAt, INTERVAL 3 HOUR), '%d.%m.%Y %H:%i' ) AS kasalanmaZamani, d.*, tip.adi as tipAdi FROM kasa AS k LEFT JOIN ( SELECT kasaID, count(*) AS kasaIciMiktar, GROUP_CONCAT(y.num_seq) AS siparisSiraNolari FROM kasa_detay AS x LEFT JOIN coda_linea AS y ON y.id = x.codaLineaID GROUP BY kasaID ) AS d ON k.kasaID = d.kasaID LEFT JOIN kasa_tip AS tip ON k.kasaTipID = tip.kasaTipID WHERE k.sevkiyatYonetimiIrsaliyeID = " + irsaliyeID + " ) AS x";

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

                    respData['design'] = design;
                    res.json(respData);
                }


            });

        }

        if (err) {
            res.status(400).json(err);
        }
    });

});

module.exports = router;