const { filter } = require('async');
const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis";
const keyExpr = "siparisYonetimiKesinSiparisID";

const operasyonHareketiEkle = require('./kesinSiparisOperasyonKaydi');
const durumGuncelle = require('./kesinSiparisDurumGuncelleme');

router.post('/boxOperasyonDurum', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        let body = req.body;
        let ID = body.userData["userFirmaTurID"];

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

        const oldRecord = (await db.sequelize.query(`SELECT t.siparisDurumID, MAX(har.siparisYonetimiKesinSiparisOperasyonID) as operasyonID FROM ${table} as t LEFT JOIN siparis_yonetimi_kesin_siparis_hareket as har ON har.${keyExpr} = t.${keyExpr}  WHERE t.${keyExpr} = '${ID}' GROUP BY t.${keyExpr}`, { type: db.Sequelize.QueryTypes.SELECT })
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
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = '${siparisID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if ([2, 3, 4].includes(sipDurum['siparisDurumID'])) {
                throw "sadece taslak sipariş onaya çıkarılabilir!";
            }
            else {

                if (sipDurum['operasyonID'] != 2) {
                    throw "sipariş detayları eklendikten sonra onaya çıkarılmalıdır!"
                }

                // onaya çıkarma hareket kaydı
                await operasyonHareketiEkle(siparisID, 3, req);
                res.json("OK");

            }
        }
        else {
            throw "sipariş içeriği olmadan onaya çıkarılamaz!";
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
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = '${siparisID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if ([2, 3, 4].includes(sipDurum['siparisDurumID'])) {
                throw "sadece taslak sipariş onaya çıkarılabilir!";
            }
            else {

                // iptal notun kaydetme
                db[table].update({
                    updatedUserID: req.body.userData.userID,
                    not: req.body.not,
                },
                    {
                        where: {
                            [keyExpr]: siparisID
                        }
                    })
                    .catch(e => {
                        console.error(e);
                        throw "iptal notu kaydedilirken hatayla karşılaşıldı!";
                    })

                // iptal hareket kaydı
                await operasyonHareketiEkle(siparisID, 4, req);

                // iptal edildi durum güncelleme
                await durumGuncelle(siparisID, 3, req);


                 // mail başlangıç
                    // açılan sipaişin iptali ilgili tedarikçi firma kullanıcılarına mail ile bildiriliyor
                    const userMails = await db.sequelize.query(`
                 SELECT
                     k.ePosta, sip.siparisTarihi, firma.firmaAdi
                 FROM
                     siparis_yonetimi_kesin_siparis AS sip
                 INNER JOIN kullanici_firma AS firma ON firma.kullaniciFirmaID = sip.ureticiFirmaID
                 INNER JOIN tedarikci_firma AS tedFirma ON tedFirma.tedarikciFirmaID = sip.tedarikciFirmaID
                 INNER JOIN kullanici_firma_kullanici AS fk ON fk.kullaniciFirmaID = firma.kullaniciFirmaID
                 INNER JOIN kullanici AS k ON k.kullaniciID = fk.kullaniciID
                 WHERE
                     sip.siparisYonetimiKesinSiparisID = :siparisID
                                  `, {
                        type: db.Sequelize.QueryTypes.SELECT,
                        replacements: {
                            siparisID: siparisID
                        }
                    });

                    const customDateFormat = (tarih) => {
                        return moment(tarih).format("DD.MM.YYYY");
                    }

                    if (userMails.length > 0) {
                        let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                        let subject = 'A-PLAS Tedarikçi Portalı: İptal Edilen Sipariş';
                        let htmlMessage = "Firmanıza açılan sipariş iptal edilmiştir. Lütfen portal üzerinden ilgili siparişi kontrol ediniz ve gerekli aksiyonları alınız. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparisID + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(userMails[0]['siparisTarihi']) + "</strong> ";
                        let attachments = [];

                        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                            if (error) {
                                console.log(error);
                            }

                            if (data) {
                            }
                        });
                    }


                    // mail son


                res.json("OK");
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
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
                ${keyExpr}
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
                ${keyExpr}
        ) AS sonHar ON sonHar.${keyExpr} = sip.${keyExpr} 
        WHERE sip.${keyExpr} = '${siparisID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];


        if (sipDurum) {

            if (sipDurum['siparisDurumID'] == 3) {
                throw "iptal edilmiş sipariş onaylanamaz!";
            }
            else if (sipDurum['siparisDurumID'] == 1) {
                if (sipDurum['operasyonID'] == 3) {

                    if (firmaTurID == 1) {
                        throw "onaya çıkarılan sipariş, öncelikle satıcı tarafından onaylanmalıdır!";
                    }
                    else if (firmaTurID == 2) {
                        const miktarTarihBelirtilmeyenKalemler = await db.sequelize.query(`SELECT * FROM siparis_yonetimi_kesin_siparis_detay WHERE ${keyExpr} = '${siparisID}' AND bakiye > 0 AND (sevkTeslimTarihi IS NULL OR sevkMiktari IS NULL)`);

                        if (miktarTarihBelirtilmeyenKalemler.length > 0) {
                            throw "Bakiyesi kalan ürünler için sevk edebileceğiniz miktar veya tarih alanları ile kalem sayısı boş olmamalıdır!";
                        }
                    }


                    // onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 5, req);

                    // onay durum güncelleme
                    await durumGuncelle(siparisID, 2, req);



                    // mail başlangıç
                    // satıcının siparişi onayladığı bilgisi, siparişi açan lokasyondaki alıcı kullanıcılarına mail ile bildiriliyor
                    const userMails = await db.sequelize.query(`
                 SELECT
                     k.ePosta, sip.siparisTarihi, tedFirma.firmaAdi
                 FROM
                     siparis_yonetimi_kesin_siparis AS sip
                 INNER JOIN kullanici_firma AS firma ON firma.kullaniciFirmaID = sip.ureticiFirmaID
                 INNER JOIN tedarikci_firma AS tedFirma ON tedFirma.tedarikciFirmaID = sip.tedarikciFirmaID
                 INNER JOIN kullanici_firma_kullanici AS fk ON fk.kullaniciFirmaID = firma.kullaniciFirmaID AND sip.lokasyonID = fk.kullaniciFirmaAdresID
                 INNER JOIN kullanici AS k ON k.kullaniciID = fk.kullaniciID
                 WHERE
                     sip.siparisYonetimiKesinSiparisID = :siparisID
                                  `, {
                        type: db.Sequelize.QueryTypes.SELECT,
                        replacements: {
                            siparisID: siparisID
                        }
                    });

                    const customDateFormat = (tarih) => {
                        return moment(tarih).format("DD.MM.YYYY");
                    }

                    if (userMails.length > 0) {
                        let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                        let subject = 'A-PLAS Tedarikçi Portalı: Onay Bekleyen Sipariş';
                        let htmlMessage = "'" + userMails[0]['firmaAdi'] + "' tarafından firma onayınıza sunulan sipariş bulunmaktadır. Lütfen portal üzerinden ilgili siparişi kontrol ediniz. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparisID + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(userMails[0]['siparisTarihi']) + "</strong> ";
                        let attachments = [];

                        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                            if (error) {
                                console.log(error);
                            }

                            if (data) {
                            }
                        });
                    }


                    // mail son

                }
                else {
                    throw "taslak sipariş önce satıcı onayına sunulmalıdır!";
                }
            }
            else if (sipDurum['siparisDurumID'] == 4) { // şartlı onay
                if (firmaTurID == 2) {

                    // onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 6, req);


                    // mail başlangıç
                    // tarih ve miktar değişikliği bilgisi, siparişi açan lokasyondaki kullanıcı firma kullanıcılarına mail ile bildiriliyor
                    const userMails = await db.sequelize.query(`
                 SELECT
                     k.ePosta, sip.siparisTarihi, tedFirma.firmaAdi
                 FROM
                     siparis_yonetimi_kesin_siparis AS sip
                 INNER JOIN kullanici_firma AS firma ON firma.kullaniciFirmaID = sip.ureticiFirmaID
                 INNER JOIN tedarikci_firma AS tedFirma ON tedFirma.tedarikciFirmaID = sip.tedarikciFirmaID
                 INNER JOIN kullanici_firma_kullanici AS fk ON fk.kullaniciFirmaID = firma.kullaniciFirmaID AND sip.lokasyonID = fk.kullaniciFirmaAdresID
                 INNER JOIN kullanici AS k ON k.kullaniciID = fk.kullaniciID
                 WHERE
                     sip.siparisYonetimiKesinSiparisID = :siparisID
                                  `, {
                        type: db.Sequelize.QueryTypes.SELECT,
                        replacements: {
                            siparisID: siparisID
                        }
                    });

                    const customDateFormat = (tarih) => {
                        return moment(tarih).format("DD.MM.YYYY");
                    }

                    if (userMails.length > 0) {
                        let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                        let subject = 'A-PLAS Tedarikçi Portalı: Güncellenen Sipariş';
                        let htmlMessage = "'" + userMails[0]['firmaAdi'] + "' firması, sipariş üzerinde sevk edilebilecek miktar ve tarih alanlarında güncelleme yapmış ve firma onayınıza sunulmuştur. Lütfen portal üzerinden ilgili siparişi kontrol ediniz. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparisID + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(userMails[0]['siparisTarihi']) + "</strong> ";
                        let attachments = [];

                        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                            if (error) {
                                console.log(error);
                            }

                            if (data) {
                            }
                        });
                    }


                    // mail son

                }
                else if (firmaTurID == 1) {

                    // alıcı onay hareket kaydı
                    await operasyonHareketiEkle(siparisID, 7, req);

                    // onay durum güncelleme
                    await durumGuncelle(siparisID, 2, req);


                    // ilgili tedarikçi firma kullanılarına sevkiyatın başlanabileceğini bildiren mail bilgisi gönderiliyor
                    const userMails = await db.sequelize.query(`
                SELECT
                    k.ePosta, sip.siparisTarihi, firma.firmaAdi
                FROM
                    siparis_yonetimi_kesin_siparis AS sip
                INNER JOIN kullanici_firma AS firma ON firma.kullaniciFirmaID = sip.ureticiFirmaID
                INNER JOIN tedarikci_firma AS tedFirma ON tedFirma.tedarikciFirmaID = sip.tedarikciFirmaID
                INNER JOIN tedarikci_firma_kullanici AS fk ON fk.tedarikciFirmaID = tedFirma.kullaniciFirmaID
                INNER JOIN kullanici AS k ON k.kullaniciID = fk.kullaniciID
                WHERE
                    sip.siparisYonetimiKesinSiparisID = :siparisID
                                 `, {
                        type: db.Sequelize.QueryTypes.SELECT,
                        replacements: {
                            siparisID: siparisID
                        }
                    });

                    const customDateFormat = (tarih) => {
                        return moment(tarih).format("DD.MM.YYYY");
                    }

                    if (userMails.length > 0) {
                        let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                        let subject = 'A-PLAS Tedarikçi Portalı: Onaylanan Sipariş';
                        let htmlMessage = "Firmanıza açılan sipariş onaylanmış ve sevkiyatının başlaması beklenmektedir. Lütfen portal üzerinden ilgili siparişi kontrol ederek sevkiyatı başlatınız. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparisID + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(userMails[0]['siparisTarihi']) + "</strong> ";
                        let attachments = [];

                        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                            if (error) {
                                console.log(error);
                            }

                            if (data) {
                            }
                        });
                    }

                }
            }
            else if (sipDurum['siparisDurumID'] == 2) {

                throw "onaylanmış sipariş, tekrardan onaylanamaz!";

            }
        }

        return res.json("OK");


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
	tedAdres.adres AS cikisYeri,
    lokasyon.kisaKodu AS lokasyon
FROM
    ${table} AS t
LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID
LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID
LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID
LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID
LEFT JOIN (
	SELECT
		MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID,
		${keyExpr}

	FROM
		siparis_yonetimi_kesin_siparis_hareket
	GROUP BY
        ${keyExpr}
) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr}
LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID
LEFT JOIN kullanici_firma_adres as lokasyon ON lokasyon.kullaniciFirmaAdresID = t.lokasyonID
WHERE
	t.ureticiFirmaID = '${userFirmaID}'
ORDER BY
	t.createdAt DESC`;

        }
        else if (userFirmaTurID == 2) { // tedarikci firma
            rawQuery = `
            
SELECT
	t.*, t.createdAt AS dokumanTarihi,
	oper.saticiFirmaDurum AS durumu,
	tedarikciFirma.firmaAdi AS tedarikciFirma,
	ureticiFirma.firmaAdi AS ureticiFirma,
	uretAdres.adres AS varisYeri,
	tedAdres.adres AS cikisYeri,
    lokasyon.kisaKodu AS lokasyon
FROM
    ${table} AS t
LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID
LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID
LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID
LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID
LEFT JOIN (
	SELECT
		MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID,
		${keyExpr}
	FROM
		siparis_yonetimi_kesin_siparis_hareket
	GROUP BY
        ${keyExpr}
) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr}
LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID
LEFT JOIN kullanici_firma_adres as lokasyon ON lokasyon.kullaniciFirmaAdresID = t.lokasyonID
WHERE
	t.tedarikciFirmaID = '${userFirmaID}' AND sonHar.siparisYonetimiKesinSiparisOperasyonID > 2
ORDER BY
	t.createdAt DESC`;
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
        }, async (datum, err) => {
            if (datum) {
                res.status(200).json(datum);

                // hareket kaydı
                await operasyonHareketiEkle(datum[keyExpr], 1, req);

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

        const sipDurum = (await db.sequelize.query(`SELECT t.siparisDurumID, MAX(har.siparisYonetimiKesinSiparisOperasyonID) as operasyonID FROM ${table} as t LEFT JOIN siparis_yonetimi_kesin_siparis_hareket as har ON har.${keyExpr} = t.${keyExpr}  WHERE t.${keyExpr} = ${id} GROUP BY t.${keyExpr}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (sipDurum) {
            if (sipDurum.siparisDurumID != 1) {
                throw "sadece taslak siparişler silinebilir";
            }
            else {

                if (sipDurum.operasyonID == 3) {
                    throw "onaya çıkarılmış sipariş silinemez!";
                }

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