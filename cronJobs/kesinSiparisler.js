const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');
const moment = require('moment');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const table = "siparis_yonetimi_kesin_siparis";
const keyExpr = "siparisYonetimiKesinSiparisID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);
const helperService = require("../helpers/helperService");


// 3 dk da bir çalışacak cronJob:  D1 ve D2 deki satın alma kesin siparişlerini kontrol edilip portala aktarılmasını sağlayan senkronizasyon
module.exports = async function kesinSiparisler() {

    cron.schedule("0 */15 * * * *", async function () {

        try {

            let eesQueryForOrders = `
        SELECT
            siparis.SIPARISNO,
            firma.CARI_FIR_KODU,
            COUNT (*) AS siparisKalemAdet,
            siparis.TALEP_SICIL
        FROM
            SIP_VER AS siparis
        INNER JOIN FIRMALAR AS firma ON siparis.FIRMALAR_KAY = firma.KAYITNO
        WHERE
            siparis.SIP_BAKIYE > 0
        AND siparis.KAPA_KODU != 'K'
        GROUP BY
            firma.CARI_FIR_KODU,
            siparis.SIPARISNO,
            siparis.TALEP_SICIL
                    `;

            let eesQueryForOrderItems = `
SELECT
	siparis.SIP_MIKTAR AS siparisMiktari,
	urun.OB_ISLEM AS olcuBirimiKodu,
	siparis.SIP_TARIH AS siparisTarihi,
	siparis.ONG_TESTAR AS siparisTeslimTarihi,
	urun.MLZ_ADI AS stokAdi,
	urun.STOKNO AS stokKodu,
	siparis.KAYITNO AS eesKayitNo,
	alisKat.TED_STOKNO AS tedarikciUrunKodu,
    siparis.TALEP_SICIL AS talepEdenSicil,
    siparis.SIP_BAKIYE AS bakiye
FROM
	SIP_VER AS siparis
INNER JOIN FIRMALAR AS firma ON siparis.FIRMALAR_KAY = firma.KAYITNO
INNER JOIN STK_MAS AS urun ON siparis.STK_MAS_KAY = urun.KAYITNO
INNER JOIN ALIS_KAT AS alisKat ON siparis.ALIS_KAT_KAY = alisKat.KAYITNO
WHERE
	siparis.SIPARISNO LIKE :siparisNo
AND firma.CARI_FIR_KODU LIKE :cariFirmaKodu
                    `;

            // portaldaki D1 ve D2 deki siparişleri kontrol edilip, portala aktarılmasını gerçekleştirir

            const d1FirmaAdresID = "547dd4d6-3ba9-49f5-bded-58fd7a3dc2a1";
            const d2FirmaAdresID = "30612299-241f-447e-8881-db060282aba9";

            const d1Siparisleri = await eesD1.query(eesQueryForOrders, {
                type: eesD1.QueryTypes.SELECT
            });

            const d2Siparisleri = await eesD2.query(eesQueryForOrders, {
                type: eesD2.QueryTypes.SELECT
            })

            // henüz sevk beklemeyen (alıcı onayı olmayan/ henüz kapanmamış) tüm siparişler
            const mevcutSiparisler = await db.sequelize.query(`SELECT t.* FROM ${table} as t LEFT JOIN (
                SELECT
                    MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID,
                    ${keyExpr}
                FROM
                    siparis_yonetimi_kesin_siparis_hareket
                GROUP BY
                    ${keyExpr}
            ) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr} WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID NOT IN (4,7)`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const tedarikciFirmalar = await db.sequelize.query(`SELECT firma.tedarikciFirmaID, firma.firmaAdi, firma.firmaKodu, adr.tedarikciFirmaAdresID, adr.adres FROM tedarikci_firma as firma LEFT JOIN tedarikci_firma_adres as adr ON adr.tedarikciFirmaID = firma.tedarikciFirmaID`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const olcuBirimleri = await db.sequelize.query(`SELECT * FROM genel_olcu_birimi`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const stoklar = await db.sequelize.query(`SELECT * FROM urun_yonetimi_uretici_urun`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const kullaniciFirma = await db.sequelize.query(`SELECT firma.kullaniciFirmaID, firma.firmaAdi, firma.firmaKodu, adr.kullaniciFirmaAdresID, adr.adres, adr.kisaKodu FROM kullanici_firma as firma LEFT JOIN kullanici_firma_adres as adr ON adr.kullaniciFirmaID = firma.kullaniciFirmaID`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const kullanicilar = await db.sequelize.query(`SELECT * FROM kullanici`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const findMatchPersonelUserItem = (sicil) => {

                const matchedRow = kullanicilar.filter(g => g.eesSicilKodu == sicil);
                if (matchedRow.length > 0) {
                    return matchedRow[0];
                }
                else {
                    return null;
                }

            }

            const findMatchFirmaItem = (kod) => {

                const matchedRow = tedarikciFirmalar.filter(g => g.firmaKodu == kod);
                if (matchedRow.length > 0) {
                    return matchedRow[0];
                }
                else {
                    return null;
                }

            }

            const findMatchOlcuBirimiItem = (kod) => {

                const matchedRow = olcuBirimleri.filter(g => g.kodu == kod);
                if (matchedRow.length > 0) {
                    return matchedRow[0];
                }
                else {
                    return null;
                }

            }

            const findMatchStokItem = (kod, firmaLokasyonID) => {

                const matchedRow = stoklar.filter(g => g.kodu == kod && g.kullaniciFirmaAdresID == firmaLokasyonID);
                if (matchedRow.length > 0) {
                    return matchedRow[0];
                }
                else {
                    return null;
                }

            }

            const findMatchFirmaAdresItem = (adresKodu) => {

                const matchedRow = kullaniciFirma.filter(g => g.kullaniciFirmaAdresID == adresKodu);
                if (matchedRow.length > 0) {
                    return matchedRow[0];
                }
                else {
                    return null;
                }

            }

            const eklenecekler = [];
            const guncellenecekler = [];

            d1Siparisleri.forEach(sipD1 => {

                const matchedFirma = mevcutSiparisler.filter(sip => sipD1.SIPARISNO == sip.siparisNo && sipD1.CARI_FIR_KODU == sip.tedarikciFirmaKodu && sip.lokasyonID == d1FirmaAdresID);

                sipD1['lokasyonID'] = d1FirmaAdresID;

                if (matchedFirma.length > 0) {
                    guncellenecekler.push({ eesKayit: sipD1, portalKayit: matchedFirma[0] });
                } else {
                    eklenecekler.push(sipD1);
                }

            });

            d2Siparisleri.forEach(sipD2 => {

                const matchedFirma = mevcutSiparisler.filter(sip => sipD2.SIPARISNO == sip.siparisNo && sipD2.CARI_FIR_KODU == sip.tedarikciFirmaKodu && sip.lokasyonID == d2FirmaAdresID);

                sipD2['lokasyonID'] = d2FirmaAdresID;

                if (matchedFirma.length > 0) {
                    guncellenecekler.push({ eesKayit: sipD2, portalKayit: matchedFirma[0] });
                } else {
                    eklenecekler.push(sipD2);
                }

            });

            async function addSiparis(record) {

                delete record[keyExpr];

                record['siparisNo'] = record['SIPARISNO'];
                record['siparisTarihi'] = moment(record['SIP_TARIH']).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                const tedFirma = findMatchFirmaItem(record['CARI_FIR_KODU']);
                record['tedarikciFirmaID'] = tedFirma ? tedFirma['tedarikciFirmaID'] : null;
                record['tedarikciFirmaKodu'] = tedFirma ? tedFirma['firmaKodu'] : null;
                record['tedarikciFirmaAdi'] = tedFirma ? tedFirma['firmaAdi'] : null;
                record['cikisAdresiID'] = tedFirma ? tedFirma['tedarikciFirmaAdresID'] : null;
                record['cikisAdresi'] = tedFirma ? tedFirma['adres'] : null;
                record['siparisDurumID'] = 1;
                record['lokasyonID'] = record['lokasyonID'];
                const kulFirma = findMatchFirmaAdresItem(record['lokasyonID']);
                record['ureticiFirmaID'] = kulFirma ? kulFirma['kullaniciFirmaID'] : null;
                record['ureticiFirmaKodu'] = kulFirma ? kulFirma['firmaKodu'] : null;
                record['ureticiFirmaAdi'] = kulFirma ? kulFirma['firmaAdi'] : null;
                record['varisAdresiID'] = kulFirma ? kulFirma['kullaniciFirmaAdresID'] : null;
                record['varisAdresi'] = kulFirma ? kulFirma['adres'] : null;
                const talepEdenPersonel = findMatchPersonelUserItem(record['TALEP_SICIL']);
                record['createdUserID'] = talepEdenPersonel ? talepEdenPersonel['kullaniciID'] : null;

                const yeniSiparis = await db[table]
                    .create(record)
                    .catch(e => {
                        console.log("Siparis kaydı oluştururken hata oluştu");
                        throw e;
                    });


                const eesDB = record['lokasyonID'] == 1 ? eesD1 : eesD2;

                const siparisKalemleri = await eesDB.query(eesQueryForOrderItems, {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        siparisNo: record['SIPARISNO'],
                        cariFirmaKodu: record['CARI_FIR_KODU']
                    }

                })
                    .catch(e => {
                        console.log("Siparise kalemleri sorgulanırken hata oluştu");
                        throw e;
                    });


                const yeniKalemler = await db.siparis_yonetimi_kesin_siparis_detay
                    .bulkCreate(siparisKalemleri.map(p => {

                        let olcuBirimi = findMatchOlcuBirimiItem(p.olcuBirimiKodu);
                        let stok = findMatchStokItem(p.stokKodu, record['lokasyonID']);
                        let talepEdenPersonel = findMatchPersonelUserItem(p.talepEdenSicil);

                        return {
                            siparisYonetimiKesinSiparisID: yeniSiparis[keyExpr],
                            siparisMiktari: p.siparisMiktari,
                            siparisTeslimTarihi: moment(p.siparisTeslimTarihi).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                            eesKayitNo: p.eesKayitNo,
                            stokKodu: p.stokKodu,
                            stokAdi: p.stokAdi,
                            bakiye: p.bakiye,
                            tedarikciUrunKodu: p.tedarikciUrunKodu,
                            genelOlcuBirimiID: olcuBirimi ? olcuBirimi['genelOlcuBirimiID'] : null,
                            urunYonetimiUreticiUrunID: stok ? stok['urunYonetimiUreticiUrunID'] : null,
                            createdUserID: talepEdenPersonel ? talepEdenPersonel['kullaniciID'] : null
                        }
                    }))
                    .catch(e => {
                        console.log("Siparis kalemleri oluştururken hata oluştu");
                        throw e;
                    });

                const sonHareket = await db.siparis_yonetimi_kesin_siparis_hareket
                    .create({
                        siparisYonetimiKesinSiparisID: yeniSiparis[keyExpr],
                        siparisYonetimiKesinSiparisOperasyonID: 3, //  alıcı onaya çıkarma
                        createdUserID: record['createdUserID']
                    })
                    .catch(e => {
                        console.log("Siparise operasyon(ID:3) hareket işlerken hata oluştu");
                        throw e;
                    });


                // ilgili tedarikçi firma kullanılarına yeni sipariş mail bilgisi gönderiliyor
                const userMails = await db.sequelize.query("SELECT ePosta FROM kullanici as k INNER JOIN tedarikci_firma_kullanici as ik ON ik.kullaniciID = k.kullaniciID INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = ik.tedarikciFirmaID WHERE ik.tedarikciFirmaID = :tedarikciID", {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        tedarikciID: tedFirma['tedarikciFirmaID']
                    }
                });

                const customDateFormat = (tarih) => {
                    return moment(tarih).format("DD.MM.YYYY");
                }

                if (userMails.length > 0) {
                    let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                    let subject = 'A-PLAS Tedarikçi Portalı: Yeni Sipariş';
                    let htmlMessage = "'" + kulFirma['firmaAdi'] + "' tarafından firmanıza yeni bir sipariş oluşturmuştur. Lütfen portal üzerinden ilgili siparişi teyit ediniz. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + yeniSiparis[keyExpr] + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(record['siparisTarihi']) + "</strong> ";
                    let attachments = [];

                    helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                        if (error) {
                            console.log(error);
                        }

                        if (data) {
                        }
                    });
                }

                return yeniSiparis;

            }

            async function updateSiparis(obj) {

                // durumlar: 
                //      1: sipariş kalemi, ekleyebilir/silebilir
                //      2: sipariş kaleminde tarih veya miktar alanını değiştirebilir 

                const eesSiparisKayit = obj.eesKayit;
                const portalSiparisKayit = obj.portalKayit;

                const eesDB = eesSiparisKayit['lokasyonID'] == 1 ? eesD1 : eesD2;

                const siparisKalemleriEES = await eesDB.query(eesQueryForOrderItems, {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        siparisNo: eesSiparisKayit['SIPARISNO'],
                        cariFirmaKodu: eesSiparisKayit['CARI_FIR_KODU']
                    }

                })
                    .then(data => data.map(t => {
                        t['lokasyonID'] = eesSiparisKayit['lokasyonID'] == 1 ? d1FirmaAdresID : d2FirmaAdresID;
                        return t;
                    }))
                    .catch(e => {
                        console.log("Güncellemede, EES üzerinde sipariş kalemleri sorgulanırken hata oluştu");
                        throw e;
                    });

                let yeniKalemler = [];
                let guncellenenKalemler = [];
                let silinecekKalemler = [];

                const siparisKalemleriPortal = await db.sequelize.query(`SELECT * FROM siparis_yonetimi_kesin_siparis_detay WHERE siparisYonetimiKesinSiparisID = :siparisID`, {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        siparisID: portalSiparisKayit[keyExpr]
                    }

                })
                    .catch(e => {
                        console.log("Portal üzerinde sipariş kalemleri sorgulanırken hata oluştu");
                        throw e;
                    });


                async function addSiparisDetay(p) {

                    let olcuBirimi = findMatchOlcuBirimiItem(p.olcuBirimiKodu);
                    let stok = findMatchStokItem(p.stokKodu, p['lokasyonID']);
                    let talepEdenPersonel = findMatchPersonelUserItem(p.talepEdenSicil);

                    return db.siparis_yonetimi_siparis_detay.create({
                        siparisYonetimiKesinSiparisID: p[keyExpr],
                        siparisMiktari: p.siparisMiktari,
                        siparisTeslimTarihi: moment(p.siparisTeslimTarihi).utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }),
                        eesKayitNo: p.eesKayitNo,
                        stokKodu: p.stokKodu,
                        stokAdi: p.stokAdi,
                        bakiye: p.bakiye,
                        tedarikciUrunKodu: p.tedarikciUrunKodu,
                        genelOlcuBirimiID: olcuBirimi ? olcuBirimi['genelOlcuBirimiID'] : null,
                        urunYonetimiUreticiUrunID: stok ? stok['urunYonetimiUreticiUrunID'] : null,
                        createdUserID: talepEdenPersonel ? talepEdenPersonel['kullaniciID'] : null
                    })
                        .catch(err => {
                            console.log("Yeni sipariş kalemi eklenirken hatayla karşılaşıldı!");
                            throw err;
                        });

                }

                async function deleteSiparisDetay(p) {

                    return db.sequelize.query(`DELETE FROM siparis_yonetimi_kesin_siparis_detay WHERE siparisYonetimiKesinSiparisDetayID = '${p['siparisYonetimiKesinSiparisDetayID']}'`, {
                        type: db.Sequelize.QueryTypes.DELETE
                    });

                }

                async function updateSiparisDetay(p) {

                    const updatedDetay = await db.siparis_yonetimi_kesin_siparis_detay
                        .update({
                            siparisMiktari: p.siparisMiktari,
                            siparisTeslimTarihi: p.siparisTeslimTarihi,
                            bakiye: p.bakiye
                        }, {
                            where: {
                                siparisYonetimiKesinSiparisDetayID: p['siparisYonetimiKesinSiparisDetayID']
                            }
                        })
                        .catch(e => {
                            console.log("sipariş detayı güncellenirken hatayla karşılaşıldı")
                            throw e;
                        });

                    return

                }


                // eesdeki kalem sayısı, portal daki kalemlerden fazlaysa
                if (siparisKalemleriEES.length > siparisKalemleriPortal.length) {
                    // eklemeler var. mevcutlarda güncelleme olabilir

                    siparisKalemleriEES.forEach(eesKalem => {

                        const matchedKalem = siparisKalemleriPortal.filter(portalKalem => portalKalem.eesKayitNo == eesKalem.eesKayitNo);
                        if (matchedKalem.length > 0) {

                            const eslesenPortalKayit = matchedKalem[0];

                            const portalTeslimTarihi = moment(eslesenPortalKayit.siparisTeslimTarihi).format('YYYY-MM-DD');
                            const eesTeslimTarihi = moment(eesKalem.siparisTeslimTarihi).format('YYYY-MM-DD');
                            const portalSiparisMiktari = eslesenPortalKayit.siparisMiktari ? eslesenPortalKayit.siparisMiktari : 0;
                            const eesSiparisMiktari = eesKalem.siparisMiktari ? eesKalem.siparisMiktari : 0;

                            if ((portalTeslimTarihi != eesTeslimTarihi) || (portalSiparisMiktari != eesSiparisMiktari)) {

                                guncellenenKalemler.push({
                                    siparisDetayID: eslesenPortalKayit['siparisYonetimiKesinSiparisDetayID'],
                                    siparisMiktari: eesSiparisMiktari,
                                    siparisTeslimTarihi: eesTeslimTarihi,
                                    bakiye: eesKalem.bakiye
                                })


                            }

                        } else {
                            yeniKalemler.push(eesKalem);
                        }


                    });

                }
                else {
                    // silinecekler var. mevcutlarda güncelleme olabilir

                    siparisKalemleriPortal.forEach(portalKalem => {

                        const matchedKalem = siparisKalemleriEES.filter(portalKalem => portalKalem.eesKayitNo == eesKalem.eesKayitNo);
                        if (matchedKalem.length > 0) {

                            const eslesenEESKayit = matchedKalem[0];
                            const portalTeslimTarihi = moment(portalKalem.siparisTeslimTarihi).format('YYYY-MM-DD');
                            const eesTeslimTarihi = moment(eslesenEESKayit.siparisTeslimTarihi).format('YYYY-MM-DD');
                            const portalSiparisMiktari = portalKalem.siparisMiktari ? portalKalem.siparisMiktari : 0;
                            const eesSiparisMiktari = eslesenEESKayit.siparisMiktari ? eslesenEESKayit.siparisMiktari : 0;

                            if ((portalTeslimTarihi != eesTeslimTarihi) || (portalSiparisMiktari != eesSiparisMiktari)) {

                                guncellenenKalemler.push({
                                    siparisDetayID: portalKalem['siparisYonetimiKesinSiparisDetayID'],
                                    siparisMiktari: eesSiparisMiktari,
                                    siparisTeslimTarihi: eesTeslimTarihi,
                                    bakiye: eslesenEESKayit.bakiye
                                })


                            }

                        }
                        else {
                            silinecekKalemler.push(portalKalem);
                        }


                    });

                }

                const yeniSiparisDetaylari = await Promise.all(yeniKalemler.map(k => {
                    return addSiparisDetay(k);
                }))
                    .catch(e => {
                        log.error(e);
                    });

                const guncellenenSiparisDetaylari = await Promise.all(guncellenenKalemler.map(k => {
                    return updateSiparisDetay(k);
                }))
                    .catch(e => {
                        log.error(e);
                    });


                const silinenSiparisDetaylari = await Promise.all(silinecekKalemler.map(k => {
                    return deleteSiparisDetay(k);
                }))
                    .catch(e => {
                        log.error(e);
                    });

                // ilgili tedarikçi firma kullanılarına sipariş güncellendi mail bilgisi gönderiliyor
                const userMails = await db.sequelize.query("SELECT ePosta FROM kullanici as k INNER JOIN tedarikci_firma_kullanici as ik ON ik.kullaniciID = k.kullaniciID INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = ik.tedarikciFirmaID WHERE ik.tedarikciFirmaID = :tedarikciID", {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        tedarikciID: portalSiparisKayit['tedarikciFirmaID']
                    }
                });

                const customDateFormat = (tarih) => {
                    return moment(tarih).format("DD.MM.YYYY");
                }

                if (userMails.length > 0) {
                    let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                    let subject = 'A-PLAS Tedarikçi Portalı: Güncellenen Sipariş';
                    let htmlMessage = "'" + kulFirma['firmaAdi'] + "' tarafından firmanıza oluşturulan sipariş güncellenmiştir. Lütfen portal üzerinden ilgili siparişi teyit ediniz. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + portalSiparisKayit[keyExpr] + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(portalSiparisKayit['siparisTarihi']) + "</strong> ";
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

            await Promise.all(eklenecekler.map(sip => {
                return addSiparis(sip);
            }))
                .catch(e => {
                    log.error(e);
                });

            await Promise.all(guncellenecekler.map(sip => {
                return updateSiparis(sip);
            }))
                .catch(e => {
                    log.error(e);
                });


        }
        catch (err) {
            console.error(err);
            log.error(err);
        }


    });

}