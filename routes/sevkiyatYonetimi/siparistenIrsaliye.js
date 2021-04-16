const express = require('express');
const router = express.Router();
const crudHelper = require('../../helpers/crudHelper');
const db = require('../../models');

const table = "sevkiyat_yonetimi_irsaliye";
const keyExpr = "sevkiyatYonetimiIrsaliyeID";

router.post('/kaydet', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const siparisID = filterData.siparisID;

        if (!siparisID) {
            throw "sipariş ID boş olamaz!"
        }

        const sipDurum = (await db.sequelize.query(`
        
        SELECT sip.*, sonHar.operasyonID, kf.firmaAdi as ureticiFirmaAdi, kf.firmaKodu as ureticiFirmaKodu, tf.firmaAdi as tedarikciFirmaAdi, tf.firmaKodu as tedarikciFirmaKodu, kfa.adres as varisAdresi, tfa.adres as cikisAdresi
        FROM siparis_yonetimi_kesin_siparis as sip
        LEFT JOIN kullanici_firma as kf ON sip.ureticiFirmaID = kf.kullaniciFirmaID
        LEFT JOIN kullanici_firma_adres kfa ON sip.varisAdresiID = kfa.kullaniciFirmaAdresID 
        LEFT JOIN tedarikci_firma as tf ON sip.tedarikciFirmaID = tf.tedarikciFirmaID 
        LEFT JOIN tedarikci_firma_adres tfa ON sip.cikisAdresiID = tfa.tedarikciFirmaAdresID 
        LEFT JOIN (
            SELECT
            MAX(siparisYonetimiKesinSiparisOperasyonID) as operasyonID,
            siparisYonetimiKesinSiparisID
        
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
            siparisYonetimiKesinSiparisID
        ) AS sonHar ON sonHar.siparisYonetimiKesinSiparisID = sip.siparisYonetimiKesinSiparisID
        WHERE sip.siparisYonetimiKesinSiparisID = '${siparisID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                console.log(e);
                throw "Sorgulama esnasında hata oluştu!";
            }))[0];

        if (sipDurum) {

            if (sipDurum['operasyonID'] != 7) {
                throw "sadece sevk bekleyen (alıcı onayından geçmiş) sipariş üzerinden irsaliye alınabilir!";
            }

            const filterData = req.body;
            const detaylar = filterData.detaylar;
            const talepInfo = filterData.talepInfo;
            filterData['data'] = {};

            let messages = [];

            if (!talepInfo['irsaliyeNo']) {
                messages.push("İrsaliye Numarası boş olamaz!");
            }

            if (talepInfo['sevkiyatYonetimiIrsaliyeDurumID'] == 2 && !talepInfo['sevkTarihi']) {
                messages.push("Alıcıya gönderilecek irsaliyede Sevk Tarihi  boş olamaz!");
            }

            if (!detaylar || detaylar.length == 0) {
                messages.push("irsaliye detayları boş olamaz!");
            }
            else {

                const isPositiveNumber = (numberStr) => {
                    const pattern = new RegExp('^[1-9]\\d*$');
                    return pattern.test(numberStr)
                };

                detaylar.forEach(d => {

                    if (!isPositiveNumber(d['miktar'])) {
                        messages.push("ürün miktarı, 0'dan büyük tamsayı olmalıdır!")
                    }

                });

            }

            if (messages.length > 0) {

                return res.status(400).json(messages);

            } else {

                filterData.data['sevkiyatYonetimiIrsaliyeDurumID'] = talepInfo['sevkiyatYonetimiIrsaliyeDurumID'];
                filterData.data['irsaliyeNo'] = talepInfo['irsaliyeNo'];
                filterData.data['sevkTarihi'] = talepInfo['sevkTarihi'];
                filterData.data['siparisYonetimiKesinSiparisID'] = siparisID;
                filterData.data['tedarikciFirmaID'] = sipDurum['tedarikciFirmaID'];
                filterData.data['tedarikciFirmaAdi'] = sipDurum['tedarikciFirmaAdi'];
                filterData.data['tedarikciFirmaKodu'] = sipDurum['tedarikciFirmaKodu'];
                filterData.data['ureticiFirmaID'] = sipDurum['ureticiFirmaID'];
                filterData.data['ureticiFirmaAdi'] = sipDurum['ureticiFirmaAdi'];
                filterData.data['ureticiFirmaKodu'] = sipDurum['ureticiFirmaKodu'];
                filterData.data['cikisAdresiID'] = sipDurum['cikisAdresiID'];
                filterData.data['cikisAdresi'] = sipDurum['cikisAdresi'];
                filterData.data['varisAdresiID'] = sipDurum['varisAdresiID'];
                filterData.data['varisAdresi'] = sipDurum['varisAdresi'];
                filterData.data['siparisNo'] = sipDurum['siparisNo'];
                filterData.data['siparisTarihi'] = sipDurum['siparisTarihi'];

                await crudHelper.createR({
                    body: req.body,
                    table: table,
                    keyExpr: keyExpr
                }, (data, err) => {
                    if (data) {

                        db.sevkiyat_yonetimi_irsaliye_detay.bulkCreate(detaylar.map(detay => {
                            detay[keyExpr] = data[keyExpr];
                            detay['createdUserID'] = req.body.userData.userID;
                            detay['urunAdi'] = detay['stokAdi'];
                            detay['urunKodu'] = detay['stokKodu'];
                            delete detay['sevkiyatYonetimiIrsaliyeDetayID'];
                            delete detay['createdAt'];
                            delete detay['updatedAt'];
                            return detay;

                        }))
                            .then(() => {
                                return res.json("OK");
                            })
                            .catch(e => {
                                console.error(e);
                                return res.status(400).json("detaylar kaydedilirken hata oluştu!");
                            })

                    }

                    if (err) {
                        console.error(err);

                        return res.status(400).json("irsaliye kaydedilirken hata oluştu!");
                    }
                });

            }



        }
        else {
            throw "aranan sipariş bulunamadı";
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

router.post('/siparisDetay', async function (req, res) {
    try {
        console.log(`post request => ${req.originalUrl}`);

        const filterData = req.body;
        const siparisID = filterData.ID;

        if (!siparisID) {
            throw "sipariş id boş olamaz!";
        }

        const siparis = (await db.sequelize.query(`SELECT * FROM siparis_yonetimi_kesin_siparis WHERE siparisYonetimiKesinSiparisID = '${siparisID}'`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                throw "sipariş sorgulama esnasında hata oluştu!";
            }))[0];

        if (siparis) {

            const detaylar = await db.sequelize.query(`

SELECT
	sipDet.*, 
CASE
WHEN irsOzet.miktar IS NULL THEN
	sipDet.siparisMiktari
ELSE
	(
		sipDet.siparisMiktari - irsOzet.miktar
	)
END AS miktar

FROM
	siparis_yonetimi_kesin_siparis AS sip
LEFT JOIN siparis_yonetimi_kesin_siparis_detay AS sipDet ON sipDet.siparisYonetimiKesinSiparisID = sip.siparisYonetimiKesinSiparisID
LEFT JOIN (
	SELECT
		irs.siparisYonetimiKesinSiparisID,
		irsDet.urunYonetimiUreticiUrunID,
		irsDet.genelOlcuBirimiID,
		SUM(irsDet.miktar) AS miktar
	FROM
		sevkiyat_yonetimi_irsaliye AS irs
	LEFT JOIN sevkiyat_yonetimi_irsaliye_detay AS irsDet ON irsDet.sevkiyatYonetimiIrsaliyeID = irs.sevkiyatYonetimiIrsaliyeID
	GROUP BY
		irs.siparisYonetimiKesinSiparisID,
		irsDet.urunYonetimiUreticiUrunID,
		irsDet.genelOlcuBirimiID
) AS irsOzet ON irsOzet.siparisYonetimiKesinSiparisID = sip.siparisYonetimiKesinSiparisID
WHERE
	sip.siparisYonetimiKesinSiparisID = '${siparisID}'
AND (
	irsOzet.miktar IS NULL
 	OR 
 	sipDet.siparisMiktari > irsOzet.miktar
)
            
            `, { type: db.Sequelize.QueryTypes.SELECT })
                .catch(e => {
                    throw "sipariş detay sorgulama esnasında hata oluştu!";
                });

            return res.json(detaylar);

        }
        else {
            throw "aranan sipariş bulunamadı"
        }


    } catch (err) {
        console.error(err);
        res.status(400).json(err);
    }
});

module.exports = router;