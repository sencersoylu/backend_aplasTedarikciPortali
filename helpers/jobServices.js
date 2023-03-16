const db = require('../models');
const moment = require("moment");
const helperService = require('../helpers/helperService');
const utils = require('../helpers/utils');

const dbConnections = require('../config/dbConnections');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const uvtKaliteSeriBaslangicPeriyodikKontrol = async (log, callback, surecID = null) => {

    try {

        let rawQuery;
        if (surecID) {
            rawQuery = "SELECT k.*, gm.adi as makineAdi, gm.kodu as makineKodu FROM uvt_seri_baslangic_kontrol as k LEFT JOIN uvt_kalite_makine AS km ON km.uvtKaliteMakineID = k.uvtKaliteMakineID LEFT JOIN genel_makine AS gm ON gm.genelMakineID = km.genelMakineID WHERE k.uvtSeriBaslangicKontrolID = " + surecID;
        }
        else {
            rawQuery = "SELECT k.*, gm.adi as makineAdi, gm.kodu as makineKodu FROM uvt_seri_baslangic_kontrol as k LEFT JOIN uvt_kalite_makine AS km ON km.uvtKaliteMakineID = k.uvtKaliteMakineID LEFT JOIN genel_makine AS gm ON gm.genelMakineID = km.genelMakineID";
        }
        const now = new Date();

        const surecler = await db.sequelize.query(rawQuery, { type: db.Sequelize.QueryTypes.SELECT });
        if (surecler.length == 0) {
            log.warn("uvt seri baslangic kontrol tablosunda herhangi bir kayıt bulunamadı");
            callback(true, null);
            return;
        }

        surecler.forEach(async surec => {

            const kontrolID = +surec.uvtSeriBaslangicKontrolID;
            const durumID = +surec.uvtSeriBaslangicKontrolDurumID;
            let periyotBaslangicZamani = null;

            if (surec.bitisTarihi && surec.bitisTarihi < now) {

                // log.info("bu kontrol kapatılmıştır!");

                await durumKontrol(surec, 2, surecID);

                return;
            }

            // "kontrol bekliyor" durumunda ise dön
            if (durumID == 1) {
                return;
            }


            if (!surec.baslangicTarihi) {

                log.error("uvt seri baslangic kontrol tablosunda başlangıç tarihi tanımlı değil. kontrolID: " + kontrolID);

                await durumKontrol(surec, 3, surecID);

                return;
            }

            if (!surec.periyot && surec.periyot < 0) {
                log.error("uvt seri baslangic kontrol tablosunda periyot tanımlı değil.kontrolID: " + kontrolID);

                await durumKontrol(surec, 4, surecID);

                return;
            }


            const kaliteMakineID = +surec.uvtKaliteMakineID;
            const kaliteMakineleri = await db.sequelize.query("SELECT km.*, gm.adi, gm.kodu FROM uvt_kalite_makine as km LEFT JOIN genel_makine as gm ON km.genelMakineID = km.genelMakineID WHERE km.uvtKaliteMakineID = " + kaliteMakineID + " LIMIT 1", { type: db.Sequelize.QueryTypes.SELECT });

            if (kaliteMakineleri.length == 0) {
                log.error("uvt_kalite_makine tablosunda makine tanımlı değil.kaliteMakineID: " + kaliteMakineID);
                return;
            }

            if (!surec.uvtKaliteMakineID) {
                log.error("uvt seri baslangic kontrol tablosunda makine tanımlı değil.kontrolID: " + kontrolID);

                await durumKontrol(surec, 5, surecID);

                return;
            }

            const duruslar = await db.sequelize.query("SELECT * FROM uvt_seri_baslangic_kontrol_durus WHERE uvtSeriBaslangicKontrolID = " + kontrolID, { type: db.Sequelize.QueryTypes.SELECT });

            // kontrole ait duruslar varsa
            if (duruslar.length > 0) {

                const baslamamisDuruslar = duruslar.filter(d => !d.baslangicTarihi);
                if (baslamamisDuruslar.length > 0) {
                    log.error("makine durusunda baslangic olmadığı için kayıt oluşturulmadı. kontrolID: " + kontrolID);

                    await durumKontrol(surec, 6, surecID);

                    return;
                }

                const bitmemisDuruslar = duruslar.filter(d => !d.bitisTarihi);
                if (bitmemisDuruslar.length > 1) {
                    log.warn("birden çok makine duruşu mevcuttur. kontrolID: " + kontrolID);

                    await durumKontrol(surec, 7, surecID);
                    return;

                }
                else if (bitmemisDuruslar.length == 1) {
                    log.warn("makine durustadır. kontrolID: " + kontrolID);

                    await durumKontrol(surec, 15, surecID);
                    return;
                }

                duruslar.forEach(d => {

                    const bitTarih = Date.parse(d.bitisTarihi);

                    if (bitTarih > periyotBaslangicZamani) {
                        periyotBaslangicZamani = bitTarih;
                    }

                });

            }
            else {
                periyotBaslangicZamani = Date.parse(surec.baslangicTarihi);
            }


            const hammaddeKontrolleri = await db.sequelize.query("SELECT * FROM uvt_seri_baslangic_kontrol_hammadde WHERE uvtSeriBaslangicKontrolID = " + kontrolID + " ORDER BY uvtSeriBaslangicKontrolHammaddeID DESC LIMIT 1", { type: db.Sequelize.QueryTypes.SELECT });

            if (hammaddeKontrolleri.length == 0) {
                log.error("uvt seri baslangic kontrol hammadde kontrol kaydı bulunamadı. kontrolID: " + kontrolID);

                await durumKontrol(surec, 8, surecID); // onayGecerliilikBitisTarihi + 1 saat

                return;
            }

            const sonHammaddeKontrol = hammaddeKontrolleri[0];
            const hammaddeOnayID = sonHammaddeKontrol.uvtSeriBaslangicKontrolOnayDurumID;

            const toleransMs = 60 * 1000 * 10; // 10 dk - ms cinsinden

            if (!hammaddeOnayID) {

                const sonKontrolDateMs = Date.parse(sonHammaddeKontrol.createdAt);
                const nowMs = new Date().getTime();
                // 1 second = 1000 milliseconds
                const diff = nowMs - sonKontrolDateMs;

                // son hammadde kontrolü giririlirken 10 dk lık tolerans süresi verilmekte. 10 dk içinde değerlendirme yapılmazsa durum güncelleme ve mail tma işlemleri yapılır
                if (diff > toleransMs) {

                    log.error("uvt seri baslangic kontrol hammadde kontrolü onaylanmamıştır. Üretim durduruldu. kontrolID: " + kontrolID);
                    await durumKontrol(surec, 9, surecID, toleransMs, diff); // onayGecerliilikBitisTarihi + 1 saat
                    return;

                }
                else {

                    log.error("uvt seri baslangic kontrol hammadde kontrolü onaylanmamıştır. Üretim devam ediyor. kontrolID: " + kontrolID);
                    return;
                }

            }

            if (hammaddeOnayID == 3) { // 3 durumu: ret
                log.error("uvt seri baslangic kontrol hammadde kontrolü onaylanmamıştır. kontrolID: " + kontrolID);
                await durumKontrol(surec, 10, surecID);

                return;
            }


            const prosesKontrolleri = await db.sequelize.query("SELECT * FROM uvt_seri_baslangic_kontrol_surec WHERE uvtSeriBaslangicKontrolID = " + kontrolID + " ORDER BY uvtSeriBaslangicKontrolSurecID DESC LIMIT 1", { type: db.Sequelize.QueryTypes.SELECT });

            if (prosesKontrolleri.length == 0) {
                log.error("uvt seri baslangic kontrol proses kontrol kaydı bulunamadı. kontrolID: " + kontrolID);

                await durumKontrol(surec, 16, surecID);

                return;
            }

            const sonProsesKontrol = prosesKontrolleri[0];
            const prosesOnayID = +sonProsesKontrol.uvtSeriBaslangicKontrolOnayDurumID;

            if (!prosesOnayID) {

                const sonKontrolDateMs = Date.parse(sonProsesKontrol.createdAt);
                const nowMs = new Date().getTime();
                // 1 second = 1000 milliseconds
                const diff = nowMs - sonKontrolDateMs;

                // son proses kontrolü giririlirken 10 dk lık tolerans süresi verilmekte. 10 dk içinde değerlendirme yapılmazsa durum güncelleme ve mail tma işlemleri yapılır
                if (diff > toleransMs) {

                    log.error("uvt seri baslangic kontrol surec kontrolü onaylanmamıştır. Üretim durduruldu. kontrolID: " + kontrolID);

                    await durumKontrol(surec, 11, surecID, toleransMs, diff);

                    return;
                }
                else {
                    log.error("uvt seri baslangic kontrol surec kontrolü onaylanmamıştır. Üretim devam ediyor. kontrolID: " + kontrolID);

                    return;
                }

            }

            if (prosesOnayID == 3) { // 3 durumu: ret

                log.error("uvt seri baslangic kontrol surec kontrolü onaylanmamıştır. kontrolID: " + kontrolID);
                await durumKontrol(surec, 12, surecID);
                return;
            }


            let periyotZamani = surec.periyot * 60 * 60 * 1000; // ms
            let sonProsesKontrolTarihiMs = Date.parse(sonProsesKontrol.kontrolTarihi);
            let gecerlilikBitisTarihi = periyotBaslangicZamani;

            // duruş olmama durumunda geçerlilik bitiş hesabı
            if (periyotBaslangicZamani < sonProsesKontrolTarihiMs) {
                gecerlilikBitisTarihi = Math.ceil((sonProsesKontrolTarihiMs - periyotBaslangicZamani) / periyotZamani) * periyotZamani + periyotBaslangicZamani;
            }

            await db.sequelize.query("UPDATE uvt_seri_baslangic_kontrol SET onayGecerlilikBitisTarihi = :tarih WHERE uvtSeriBaslangicKontrolID = " + kontrolID, {
                type: db.Sequelize.QueryTypes.UPDATE, replacements: {
                    tarih: moment(new Date(gecerlilikBitisTarihi)).add(-3, 'hours').toDate()
                }
            });

            if (gecerlilikBitisTarihi < now.getTime()) {

                await durumKontrol(surec, 13, surecID);

                return;
            }

            // kontrol halen geçerli olduğundan kontrol edildi durumuna çekiyoruz
            // periyodik kontrolü gelen kaydın kontrolü tamamlanmadan kontrol edildi durumuna çeklmesini engellemek için eklenmiştir
            if (surec.uvtSeriBaslangicKontrolDurumID && surec.uvtSeriBaslangicKontrolDurumID != 13) {
                await durumKontrol(surec, 14, surecID);
            }


        });

        callback(true, null);

    } catch (e) {
        log.error("işlenmeyen hata: HATA: " + e);
        callback(false, e);
    }


}

// kapanmış iş emrine sahip bir süreç başlatılmışsa bu süreci kapatır
const uvtKaliteSeriBaslangicPeriyodikKontrolKapat = async (log, callback) => {


    try {

        const acikSurecler = await db.sequelize.query("SELECT * FROM uvt_seri_baslangic_kontrol WHERE bitisTarihi IS NULL", { type: db.Sequelize.QueryTypes.SELECT });
        if (acikSurecler.length == 0) {
            log.warn("uvt seri baslangic kontrol tablosunda herhangi bir kayıt bulunamadı");
            callback(true, null);
        }

        const kapanmisIsEmirleri = await eesD1.query("SELECT isEmri.ISEMRI_NO AS isEmriNo FROM ISE_OPER AS isEmri WHERE isEmri.KAPA_KODU = 'K'", { type: db.Sequelize.QueryTypes.SELECT });

        acikSurecler.forEach(async surec => {

            const eslesenKayitlar = kapanmisIsEmirleri.filter(wo => wo.isEmriNo == surec.isEmriNo);

            if (eslesenKayitlar.length > 0) {

                // kontrol tamamlandı durumuna da çekiliyor
                await db.sequelize.query("UPDATE uvt_seri_baslangic_kontrol SET bitisTarihi = NOW(), uvtSeriBaslangicKontrolDurumID = 2 WHERE uvtSeriBaslangicKontrolID = " + surec.uvtSeriBaslangicKontrolID, { type: db.Sequelize.QueryTypes.UPDATE });

            }

        });

        callback(true, null);

    } catch (e) {
        log.error("işlenmeyen hata: HATA: " + e);
        callback(false, e);
    }


}

const durumKontrol = async (kontrolData, durumID, surecID, toleransSuresi = undefined, sure = undefined) => {

    // şuanki durum eskisinden farklıysa güncelleme yapılacak, mail ve bildirim atılacak
    if (durumID !== kontrolData.uvtSeriBaslangicKontrolDurumID) {

        await db.sequelize.query("UPDATE uvt_seri_baslangic_kontrol SET  uvtSeriBaslangicKontrolDurumID = :durumID WHERE uvtSeriBaslangicKontrolID = " + kontrolData.uvtSeriBaslangicKontrolID, {
            type: db.Sequelize.QueryTypes.UPDATE, replacements: {
                durumID: durumID
            }
        });


        // surecID ile kontrol talebinde bulunulmuş ise bildirim ve mail atılmayacak.
        if (surecID) {
            return;
        }

        const durumDatalari = await db.sequelize.query("SELECT * FROM uvt_seri_baslangic_kontrol_durum WHERE uvtSeriBaslangicKontrolDurumID = " + durumID, {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                durumID: durumID
            }
        });

        const durumData = durumDatalari[0];


        console.log("************ kontrol bildirim kaydı güncelleme durumunda kalite sorumlularına bildirim atılıyor ******************** ");

        let bildirimMessage = "\"" + kontrolData.makineKodu + "\" kodlu \"" + kontrolData.makineAdi + "\" makinesinde \"" + kontrolData.isEmriNo + "\" nolu işemri için seri başlangıç kontrolünde oluşan durum: \"" + durumData.adi + "\"";

        let mailHtmlMessage = "<strong>\"" + kontrolData.makineKodu + "\"</strong> kodlu <strong>\"" + kontrolData.makineAdi + "\"</strong> makinesinde <strong>\"" + kontrolData.isEmriNo + "\"</strong> nolu işemri için seri başlangıç kontrolünde oluşan durum: <span style= 'color: #ff0000;'><strong>" + durumData.adi + " </strong></span>";

        if (sure) {

            const toleransMessage = utils.millisecondsToHourMinuteSecond(toleransSuresi);
            const gecenSureMessage = utils.millisecondsToHourMinuteSecond(sure);

            bildirimMessage += " " + toleransMessage + " ek tolerans süresi verilmesine rağmen " + gecenSureMessage + " dir onay verilmemiştir.";
            mailHtmlMessage += "<br>" + toleransMessage + " ek tolerans süresi verilmesine rağmen " + gecenSureMessage + " dir onay verilmemiştir.";

        }

        createBildirimAndSendMailForQualityEmployees(bildirimMessage, mailHtmlMessage);
        console.log("************ kontrol bildirim kaydı güncelleme durumunda kalite sorumlularına bildirim atılma işlemi tamamlandı ******************** ");


    }



}

const createBildirimAndSendMailForQualityEmployees = async (bildirimMessage, mailHtmlMessage) => {

    console.log("------------------- bildirim ve mail atılma başlıyor -------------------------- ");


    db.sequelize.query("SELECT * FROM genel_islem_grup_kullanici WHERE genelIslemGrupID = 1", {
        type: db.Sequelize.QueryTypes.SELECT
    })
        .then(sorumluPersonelKullanicilari => {

            if (sorumluPersonelKullanicilari.length > 0) {


                sorumluPersonelKullanicilari.forEach(emp => {

                    if (emp.kullaniciID) {

                        helperService.createBildirim(5, bildirimMessage, emp.kullaniciID, function (result, err2) {

                            if (result) {

                                console.log("------------------- bildirim  atıldı -------------------------- ", emp.kullaniciID);

                                helperService.getPersonelMailFromUserID(emp.kullaniciID, (data2, err3) => {

                                    if (data2) {

                                        let toAddress = data2; // ensar.akbas@a-plasltd.com.tr, cihan.kaya@a-plasltd.com.tr
                                        let subject = 'Portal: UVT Kalite Seri Başlangıç Periyodik Kontrol';
                                        let htmlMessage = mailHtmlMessage;
                                        let attachments = [];

                                        helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                                            if (error) {
                                                console.log(error);

                                            } else {
                                                console.log('Email sent: ' + info.response);
                                                console.log("------------------- mail  atıldı -------------------------- ", data2);


                                            }
                                        });

                                    }

                                    if (err3) {
                                        console.log(err3);
                                        console.log("------------------- mail  atılırken hata oluştu -------------------------- ", data2, " hata: ", err3);

                                    }

                                })


                            }

                            if (err2) {
                                console.log(err2);
                                console.log("------------------- bildirim  atılırken hata oluştu -------------------------- ", emp.kullaniciID, " hata: ", err2);

                            }

                        })

                    }

                })




            } else {
                console.log("çalışanlar bulunamadi")
            }
        })
        .catch(e => {
            console.log(e);
            console.log("------------------- işleme grubuna ait kullanıcılar aranırken hata oluştu -------------------------- ", e.error);

        })

    console.log("------------------- bildirim ve mail atılma işlemi bitti -------------------------- ");


}

const createBildirimAndSendMailForMaintenanceEmployees = async (periyodikBakim) => {

    db.sequelize.query("SELECT *, (SELECT adi FROM bakim_periyot WHERE bakimPeriyotID = :periyotID) as periyotAdi FROM ik_personel_sicil AS personel INNER JOIN ( SELECT mak.adi AS makineAdi, mak.kodu AS makineKodu, lok.lokasyonAdi, lok.sirketLokasyonID as makineLokasyonID, bol.adi AS uretimBolumuAdi, bol.uretimBolumleriID FROM bakim_makine AS mak LEFT JOIN sirket_lokasyon AS lok ON lok.sirketLokasyonID = mak.sirketLokasyonID LEFT JOIN uretim_bolumleri AS bol ON bol.uretimBolumleriID = mak.uretimBolumleriID WHERE mak.bakimMakineID = :makineID ) AS x ON x.makineLokasyonID = personel.sirketLokasyonID WHERE personel.genelDepartmanID = 2 AND aktifMi = 1", {
        type: db.Sequelize.QueryTypes.SELECT,
        replacements: {
            periyotID: periyodikBakim.bakimPeriyotID,
            makineID: periyodikBakim.bakimMakineID
        }
    })
        .then(employees => {

            if (employees.length > 0) {


                employees.forEach(emp => {
                    // emp.ikPersonelSicilID
                    helperService.getUserIDFromSicil(568, (data, err) => {

                        if (data) {

                            // Periyodik Bakım bildirimi
                            const bildirimHtmlMessage = emp.lokasyonAdi + ' şirket lokasyonundaki \"' + emp.makineKodu + '\" kodlu \"' + emp.makineAdi + "\" makinenin \"" + emp.periyotAdi + "\" periyoduna ait periyodik bakım kaydı oluşmuştur. Tahmini bakım tarihi: " + moment(periyodikBakim.tahminiBakimTarihi).format("DD.MM.YYYY");

                            helperService.createBildirim(4, bildirimHtmlMessage, data, function (result, err2) {

                                if (result) {

                                    helperService.getPersonelMailFromSicil(emp.ikPersonelSicilID, (data2, err3) => {

                                        if (data2) {

                                            let toAddress = "ensar.akbas@a-plasltd.com.tr, cihan.kaya@a-plasltd.com.tr"; //data2; // ensar.akbas@a-plasltd.com.tr, cihan.kaya@a-plasltd.com.tr
                                            let subject = 'Portal: Periyodik Bakım Bildirimi';
                                            let htmlMessage = "Sayın " + emp.adi + " " + emp.soyadi + ', <br> <br>' + emp.lokasyonAdi + ' şirket lokasyonundaki \"' + emp.makineKodu + '\" kodlu \"' + emp.makineAdi + "\" makinenin \"" + emp.periyotAdi + "\" periyoduna ait periyodik bakım kaydı oluşmuştur. Tahmini bakım tarihi: " + moment(periyodikBakim.tahminiBakimTarihi).format("DD.MM.YYYY");
                                            let attachments = [];

                                            helperService.mailKaydet(subject, toAddress, htmlMessage, new Date(), JSON.stringify(attachments), function (data, error) {
                                                if (error) {
                                                    console.log(error);

                                                } else {
                                                    console.log('Email sent: ' + info.response);

                                                }
                                            });

                                        }

                                        if (err3) {
                                            console.log(err3)
                                        }

                                    })


                                }

                                if (err2) {
                                    console.log(err2);
                                }

                            })

                        }

                        if (err) {
                            console.log(err);
                        }

                    })
                })




            } else {
                console.log("çalışanlar bulunamadi")
            }
        })
        .catch(e => {
            console.log(e);
        })

}

module.exports = {
    uvtKaliteSeriBaslangicPeriyodikKontrol,
    uvtKaliteSeriBaslangicPeriyodikKontrolKapat,
    createBildirimAndSendMailForMaintenanceEmployees,
    createBildirimAndSendMailForQualityEmployees
};