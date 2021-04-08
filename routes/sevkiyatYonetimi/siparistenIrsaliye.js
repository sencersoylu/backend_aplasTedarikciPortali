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
        const siparisID = +filterData.siparisID;

        const siparis = (
            await db.sequelize.query(`SELECT * FROM siparis_yonetimi_siparis WHERE siparisYonetimiSiparisID = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                throw "Sorgulama esnasında hata oluştu!";
            })
            )[0];

        if (siparis) {
            if (siparis['siparisDurumID'] != 11) {
                throw "sevk bekleyen sipariş üzerinden sadece irsaliye alınabilir!";
            }
            else {

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
                    filterData.data['siparisYonetimiSiparisID'] = siparisID;
                    filterData.data['tedarikciFirmaID'] = siparis['tedarikciFirmaID'];
                    filterData.data['ureticiFirmaID'] = siparis['ureticiFirmaID'];
                    filterData.data['cikisAdresiID'] = siparis['cikisAdresiID'];
                    filterData.data['varisAdresiID'] = siparis['varisAdresiID'];
                    filterData.data['siparisNo'] = siparis['siparisNo'];
                    filterData.data['siparisTarihi'] = siparis['siparisTarihi'];

                    await crudHelper.createR({
                        body: req.body,
                        table: table,
                        keyExpr: keyExpr
                    }, (data, err) => {
                        if (data) {

                            db.sevkiyat_yonetimi_irsaliye_detay.bulkCreate(detaylar.map(detay => {
                                detay[keyExpr] = data[keyExpr];
                                detay['createdUserID'] = req.body.userData.userID;
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
        }
        else {
            throw "aranan sipariş bulunamadı"
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
        const siparisID = +filterData.ID;

        const siparis = (await db.sequelize.query(`SELECT * FROM siparis_yonetimi_siparis WHERE siparisYonetimiSiparisID = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
            .catch(e => {
                throw "sipariş sorgulama esnasında hata oluştu!";
            }))[0];

        if (siparis) {

            const detaylar = await db.sequelize.query(`SELECT * FROM siparis_yonetimi_siparis_detay WHERE siparisYonetimiSiparisID = ${siparisID}`, { type: db.Sequelize.QueryTypes.SELECT })
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