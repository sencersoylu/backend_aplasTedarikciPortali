const { filter } = require('async');
const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis";
const keyExpr = "siparisYonetimiKesinSiparisID";

const operasyonHareketiEkle = require('./kesinSiparisOperasyonKaydi');
const durumGuncelle = require('./kesinSiparisDurumGuncelleme');

router.post('/onayaCikar', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let siparisID = body["ID"];
        let firmaTurID = req.body.userData.userFirmaTurID;

        if (!siparisID) {
            throw "sipariş ID boş olamaz!";
        }

        if (firmaTurID == 2) { // satıcı
            throw "sadece alıcı firmanın onaya çıkarma yetkisi vardır!";
        }

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM ${table} as sip 
        LEFT JOIN (
            SELECT
                siparisYonetimiKesinSiparisOperasyonID as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
            HAVING
                MAX(
                    siparisYonetimiKesinSiparisHareketID
                )
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if ([2, 3, 4].includes(sipDurum['siparisDurumID'])) {
                throw "sadece taslak sipariş onaya çıkarılabilir!";
            }
            else {

                // onaya çıkarma hareket kaydı
                await operasyonHareketiEkle(siparisID, 3, req);

            }
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/iptalEt', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let siparisID = body["ID"];
        let firmaTurID = req.body.userData.userFirmaTurID;

        if (!siparisID) {
            throw "sipariş ID boş olamaz!";
        }

        if (firmaTurID == 2) { // satıcı
            throw "sadece alıcı firma siparişi iptal edebilir!";
        }

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM ${table} as sip 
        LEFT JOIN (
            SELECT
                siparisYonetimiKesinSiparisOperasyonID as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
            HAVING
                MAX(
                    siparisYonetimiKesinSiparisHareketID
                )
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if ([2, 3, 4].includes(sipDurum['siparisDurumID'])) {
                throw "sadece taslak sipariş onaya çıkarılabilir!";
            }
            else {

                // iptal hareket kaydı
                await operasyonHareketiEkle(siparisID, 4, req);

                // iptal edildi durum güncelleme
                await durumGuncelle(siparisID, 3, req);
            }
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/onayla', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let siparisID = body["ID"];
        let firmaTurID = req.body.userData.userFirmaTurID;

        if (!siparisID) {
            throw "sipariş ID boş olamaz!";
        }

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.siparisDurumID, sonHar.operasyonID
        FROM ${table} as sip 
        LEFT JOIN (
            SELECT
                siparisYonetimiKesinSiparisOperasyonID as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
            HAVING
                MAX(
                    siparisYonetimiKesinSiparisHareketID
                )
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if (sipDurum['siparisDurumID'] == 3) {
                throw "iptal edilmiş sipariş onaylanamaz!";
            }
            else if (sipDurum['siparisDurumID'] == 1) {
                if(sipDurum['operasyonID'] == 3){
                    
                    // onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 5, req);

                    // onay durum güncelleme
                    await durumGuncelle(siparisID, 2, req);
                }
                else{
                    throw "taslak sipariş önce satıcı onayına sunulmalıdır!";
                }
            }
            else if (sipDurum['siparisDurumID'] == 4) {
                if (firmaTurID == 2) {
                    
                    // onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 6, req);
                }
                else if (firmaTurID == 1) {

                    // onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 7, req);

                    // onay durum güncelleme
                    await durumGuncelle(siparisID, 2, req);
                }
            }
            else if (sipDurum['siparisDurumID'] == 2) {

                throw "onaylanmış sipariş, tekrardan onaylanamaz!";

            }
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/boxOperasyonDurum', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let ID = body["turID"];

        if (!ID) {
            throw "firma tür ID boş olamaz!";
        }

        const aliciFirmaMi = ID == 1 ? true : false;
        const fieldName = aliciFirmaMi ? 'aliciFirmaDurum' : 'saticiFirmaDurum';

        db.sequelize.query(`SELECT ${fieldName} as durum FROM siparis_yonetimi_kesin_siparis_operasyon WHERE ${fieldName} IS NOT NULL GROUP BY ${fieldName}  ORDER BY siparisYonetimiKesinSiparisOperasyonID ASC`, { type: db.Sequelize.QueryTypes.SELECT })
            .then(d => {
                res.json(d);
            })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            });


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});


router.post('/siparisDurum', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let ID = body["ID"];

        if (!ID) {
            throw "sipariş ID boş olamaz!";
        }

        const oldRecord = (await db.sequelize.query(`SELECT t.siparisDurumID, har.siparisYonetimiKesinSiparisOperasyonID as operasyonID FROM ${table} as t LEFT JOIN siparis_yonetimi_kesin_siparis_hareket as har ON har.${keyExpr} = t.${keyExpr}  WHERE t.${keyExpr} = ${ID} GROUP BY t.${keyExpr} HAVING MAX(siparisYonetimiKesinSiparisHareketID)`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (oldRecord) {
            return res.json(oldRecord)
        }
        else {
            throw "sipariş bulunamadı!";
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/getList', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const userFirmaTurID = filterData.userData.userFirmaTurID;
        const userFirmaID = filterData.userData.userFirmaID;

        let rawQuery;

        if (userFirmaTurID == 1) { // uretici firma
            rawQuery = `
            
SELECT
	t.*, t.createdAt AS dokumanTarihi,
	oper.aliciFirmaDurum AS durumu,
	tedarikciFirma.firmaAdi AS tedarikciFirma,
	ureticiFirma.firmaAdi AS ureticiFirma,
	uretAdres.adres AS varisYeri,
	tedAdres.adres AS cikisYeri
FROM
    ${table} AS t
LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID
LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID
LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID
LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID
LEFT JOIN (
	SELECT
		siparisYonetimiKesinSiparisOperasyonID,
		${keyExpr}

	FROM
		siparis_yonetimi_kesin_siparis_hareket
	GROUP BY
        ${keyExpr}
	HAVING
		MAX(
			siparisYonetimiKesinSiparisHareketID
		)
) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr}
LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID
WHERE
	t.ureticiFirmaID = ${userFirmaID}
ORDER BY
	t.${keyExpr} DESC`;

        }
        else if (userFirmaTurID == 2) { // tedarikci firma
            rawQuery = `
            
SELECT
	t.*, t.createdAt AS dokumanTarihi,
	oper.saticiFirmaDurum AS durumu,
	tedarikciFirma.firmaAdi AS tedarikciFirma,
	ureticiFirma.firmaAdi AS ureticiFirma,
	uretAdres.adres AS varisYeri,
	tedAdres.adres AS cikisYeri
FROM
    ${table} AS t
LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID
LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID
LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID
LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID
LEFT JOIN (
	SELECT
		siparisYonetimiKesinSiparisOperasyonID,
		${keyExpr}
	FROM
		siparis_yonetimi_kesin_siparis_hareket
	GROUP BY
        ${keyExpr}
	HAVING
		MAX(
			siparisYonetimiKesinSiparisHareketID
		)
) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr}
LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID
WHERE
	t.ureticiFirmaID = ${userFirmaID} AND t.siparisDurumID != 1
ORDER BY
	t.${keyExpr} DESC`;
        }


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


router.post('/create', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let data = body["data"];

        if (!data) {
            throw "Data boş olamaz!";
        }

        if (data['siparisDurumID'] > 1) {
            throw "Taslak Sipariş, öncelikle tedarikçi onayına sunulmalıdır!";
        }

        await crudHelper.createR({
            body: req.body,
            table: table,
            keyExpr: keyExpr
        }, async (data, err) => {
            if (data) {
                res.status(200).json(data);

                // hareket kaydı
                await operasyonHareketiEkle(data[keyExpr], 1, req);

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
    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/delete', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const id = req.body.ID;

        const record = (await db.sequelize.query(`SELECT * FROM ${table} WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Kayıt sorgulama esnasında hata oluştu!";
            }))[0];

        if (record) {
            if (record.siparisDurumID != 1) {
                throw "sadece taslak siparişler silinebilir";
            }
            else {

                await db.sequelize.query(`DELETE FROM siparis_yonetimi_kesin_siparis_detay WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.DELETE })
                    .catch(e => {
                        console.log(e);
                        throw "Detay silme işlemi esnasında hata oluştu!";
                    })

                await db.sequelize.query(`DELETE FROM siparis_yonetimi_kesin_siparis_hareket WHERE ${keyExpr} = ${id}`, { type: db.Sequelize.QueryTypes.DELETE })
                    .catch(e => {
                        console.log(e);
                        throw "Hareket silme işlemi esnasında hata oluştu!";
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

module.exports = router;