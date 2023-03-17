const express = require('express');
const router = express.Router();
const db = require('../../models');

const path = require('path');
const currentFileName = path.basename(__filename, '.js');

const opts = {
    logFilePath: './logs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = require('simple-node-logger').createSimpleLogger(opts);

// taslak siparişler
const sql1 = "SELECT t.*, t.createdAt AS dokumanTarihi, oper.aliciFirmaDurum AS durumu, tedarikciFirma.firmaAdi AS tedarikciFirma, ureticiFirma.firmaAdi AS ureticiFirma, uretAdres.adres AS varisYeri, tedAdres.adres AS cikisYeri FROM siparis_yonetimi_kesin_siparis AS t LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID LEFT JOIN ( SELECT MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID, siparisYonetimiKesinSiparisID FROM siparis_yonetimi_kesin_siparis_hareket GROUP BY siparisYonetimiKesinSiparisID ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = t.siparisYonetimiKesinSiparisID LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (1,2) ORDER BY t.createdAt DESC"

// onay bekleyen siparişler
const sql2 = "SELECT t.*, t.createdAt AS dokumanTarihi, oper.aliciFirmaDurum AS durumu, tedarikciFirma.firmaAdi AS tedarikciFirma, ureticiFirma.firmaAdi AS ureticiFirma, uretAdres.adres AS varisYeri, tedAdres.adres AS cikisYeri, tedarikciFirma.tedarikciFirmaID FROM siparis_yonetimi_kesin_siparis AS t LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID LEFT JOIN ( SELECT MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID, siparisYonetimiKesinSiparisID FROM siparis_yonetimi_kesin_siparis_hareket GROUP BY siparisYonetimiKesinSiparisID ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = t.siparisYonetimiKesinSiparisID LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (:operID) ORDER BY t.createdAt DESC"

// sevk bekleyen siparişler
const sql3 = "SELECT t.*, t.createdAt AS dokumanTarihi, oper.aliciFirmaDurum AS durumu, tedarikciFirma.firmaAdi AS tedarikciFirma, ureticiFirma.firmaAdi AS ureticiFirma, uretAdres.adres AS varisYeri, tedAdres.adres AS cikisYeri FROM siparis_yonetimi_kesin_siparis AS t LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID LEFT JOIN ( SELECT MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID, siparisYonetimiKesinSiparisID FROM siparis_yonetimi_kesin_siparis_hareket GROUP BY siparisYonetimiKesinSiparisID ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = t.siparisYonetimiKesinSiparisID LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (7) ORDER BY t.createdAt DESC"

// iptal edilen siparişler
const sql4 = "SELECT t.*, t.createdAt AS dokumanTarihi, oper.aliciFirmaDurum AS durumu, tedarikciFirma.firmaAdi AS tedarikciFirma, ureticiFirma.firmaAdi AS ureticiFirma, uretAdres.adres AS varisYeri, tedAdres.adres AS cikisYeri, tedarikciFirma.tedarikciFirmaID FROM siparis_yonetimi_kesin_siparis AS t LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID LEFT JOIN ( SELECT MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID, siparisYonetimiKesinSiparisID FROM siparis_yonetimi_kesin_siparis_hareket GROUP BY siparisYonetimiKesinSiparisID ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = t.siparisYonetimiKesinSiparisID LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (4) ORDER BY t.createdAt DESC";

// onaylanan siparişler
const sql5 = "SELECT t.*, t.createdAt AS dokumanTarihi, oper.aliciFirmaDurum AS durumu, tedarikciFirma.firmaAdi AS tedarikciFirma, ureticiFirma.firmaAdi AS ureticiFirma, uretAdres.adres AS varisYeri, tedAdres.adres AS cikisYeri, tedarikciFirma.tedarikciFirmaID FROM siparis_yonetimi_kesin_siparis AS t LEFT JOIN tedarikci_firma AS tedarikciFirma ON tedarikciFirma.tedarikciFirmaID = t.tedarikciFirmaID LEFT JOIN kullanici_firma AS ureticiFirma ON ureticiFirma.kullaniciFirmaID = t.ureticiFirmaID LEFT JOIN tedarikci_firma_adres AS tedAdres ON tedAdres.tedarikciFirmaAdresID = t.cikisAdresiID LEFT JOIN kullanici_firma_adres AS uretAdres ON uretAdres.kullaniciFirmaAdresID = t.varisAdresiID LEFT JOIN ( SELECT MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID, siparisYonetimiKesinSiparisID FROM siparis_yonetimi_kesin_siparis_hareket GROUP BY siparisYonetimiKesinSiparisID ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = t.siparisYonetimiKesinSiparisID LEFT JOIN siparis_yonetimi_kesin_siparis_operasyon as oper ON oper.siparisYonetimiKesinSiparisOperasyonID = sonHar.siparisYonetimiKesinSiparisOperasyonID WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (5) ORDER BY t.createdAt DESC";

router.post('/header', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filter = req.body.filterIndex;
        const userFirmaTurID = req.body.userData.userFirmaTurID;
        const userFirmaID = req.body.userData.userFirmaID;

        if (filter == 1) { // taslak siparişler

            db.sequelize.query("select COUNT(*) as talepSayisi from (" + sql1 + ")x", {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    return res.json(sonuc[0].talepSayisi);
                })
                .catch(e => {
                    throw e;
                });

        } else if (filter == 2) { // onay bekleyen siparişler

            let operID = userFirmaTurID == 1 ? 6 : 3;
            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql2, {
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: {
                    operID: operID
                }
            })
                .then(sonuc => {
                    let talepSayisi = sonuc.length;
                    if (firmaID) {
                        talepSayisi = sonuc.filter(a => a.tedarikciFirmaID == firmaID).length;
                    }
                    return res.json(talepSayisi);
                })
                .catch(e => {
                    throw e;
                });

        } else if (filter == 3) { // sevk bekleyen siparişler
            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql3, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    let talepSayisi = sonuc.length;
                    if (firmaID) {
                        talepSayisi = sonuc.filter(a => a.tedarikciFirmaID == firmaID).length;
                    }
                    return res.json(talepSayisi);
                })
                .catch(e => {
                    throw e;
                });
        } else if (filter == 4) { // iptal edilen siparişler

            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql4, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    let talepSayisi = sonuc.length;
                    if (firmaID) {
                        talepSayisi = sonuc.filter(a => a.tedarikciFirmaID == firmaID).length;
                    }
                    return res.json(talepSayisi);
                })
                .catch(e => {
                    throw e;
                });

        }
        else if (filter == 5) { // onaylanan siparişler

            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql5, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    let talepSayisi = sonuc.length;
                    if (firmaID) {
                        talepSayisi = sonuc.filter(a => a.tedarikciFirmaID == firmaID).length;
                    }
                    return res.json(talepSayisi);
                })
                .catch(e => {
                    throw e;
                });

        }

    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/detay', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const filter = filterData.filterIndex;
        const userFirmaTurID = filterData.userData.userFirmaTurID;
        const userFirmaID = req.body.userData.userFirmaID;


        if (filter == 1) { // taslak siparişler

            db.sequelize.query(sql1, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    return res.json(sonuc);
                })
                .catch(e => {
                    throw e;
                })


        } else if (filter == 2) { // onay bekleyen siparişler

            let operID = userFirmaTurID == 1 ? 6 : 3;
            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql2, {
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: {
                    operID: operID
                }
            })
                .then(sonuc => {
                    if (firmaID) {
                        sonuc = sonuc.filter(a => a.tedarikciFirmaID == firmaID);
                    }
                    return res.json(sonuc);
                })
                .catch(e => {
                    throw e;
                })

        } else if (filter == 3) { //  sevk bekleyen siparişler

            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql3, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    if (firmaID) {
                        sonuc = sonuc.filter(a => a.tedarikciFirmaID == firmaID);
                    }
                    return res.json(sonuc);
                })
                .catch(e => {
                    throw e;
                })

        } else if (filter == 4) { //iptal edilen siparişler
            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql4, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    if (firmaID) {
                        sonuc = sonuc.filter(a => a.tedarikciFirmaID == firmaID);
                    }
                    return res.json(sonuc);

                })
                .catch(e => {
                    throw e;
                })


        } else if (filter == 5) { // onaylanan siparişler
            let firmaID = userFirmaTurID == 2 ? userFirmaID : null;

            db.sequelize.query(sql5, {
                type: db.Sequelize.QueryTypes.SELECT
            })
                .then(sonuc => {
                    if (firmaID) {
                        sonuc = sonuc.filter(a => a.tedarikciFirmaID == firmaID);
                    }
                    return res.json(sonuc);

                })
                .catch(e => {
                    throw e;
                })

        }

    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

module.exports = router;