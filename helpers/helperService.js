const db = require('../models');

// kullanıcının sicilID'si aracılığıyla mailini getiren async method
const getPersonelMailFromSicil = async (personelSicil, callbackFunc) => {


    if (personelSicil == null || personelSicil == undefined) {
        callbackFunc(null, "sicil id boş olmamalı!!");
    }

    db.sequelize.query("SELECT kul.ePosta as mail, per.sicilNo as sicilNo FROM kullanici as kul LEFT JOIN ik_personel_sicil as per ON per.ikPersonelSicilID = kul.ikPersonelSicilID WHERE kul.ikPersonelSicilID = :sicilID", {
        type: db.Sequelize.QueryTypes.SELECT, replacements: {
            sicilID: personelSicil
        }
    })
        .then((degPers) => {
            if (degPers.length > 0) {

                if (degPers[0].sicilNo == null || degPers[0].sicilNo == undefined) {
                    callbackFunc(null, "aktif personelde ilgili sicile ait mail bulunamadı!");
                } else {

                    if (degPers[0].mail == null || degPers[0].mail == undefined) {
                        callbackFunc(null, "kullanıcı üzerinde personelde ilgili sicile ait mail bulunamadı!");
                    }
                    else {
                        callbackFunc(degPers[0].mail, null);
                    }

                }
            } else {
                callbackFunc(null, "kullanıcı sicil numarası bulunamadı!");
            }

        })
        .catch(err => {
            callbackFunc(null, err)
        });

}

// kullanıcının id'si aracılığıyla mailini getiren async method
const getPersonelMailFromUserID = async (userID, callbackFunc) => {


    if (userID == null || userID == undefined) {
        callbackFunc(null, "user id boş olmamalı!!");
    }

    db.sequelize.query("SELECT kul.ePosta as mail FROM kullanici as kul WHERE kul.kullaniciID = :userID", {
        type: db.Sequelize.QueryTypes.SELECT, replacements: {
            userID: userID
        }
    })
        .then((mails) => {

            if (mails.length > 0) {
                callbackFunc(mails[0].mail, null);
            } else {
                callbackFunc(null, "kullanıcı üzerinde personelde ilgili sicile ait mail bulunamadı!");
            }

        })
        .catch(err => {
            callbackFunc(null, err);
        })

}

// bildirim oluşturan async method
const createBildirim = async (tipID, aciklama, kullaniciID, callbackFunc) => {


    db.iletisim_merkezi_bildirim
        .create({
            iletisimMerkeziBildirimTipID: tipID,
            aciklama: aciklama,
            bildirimTarihi: new Date(),
            okunduMu: false,
            okunmaTarihi: null,
            genelKullaniciID: kullaniciID
        })
        .then(result => {
            callbackFunc(result, null);
        })
        .catch(err => {
            callbackFunc(null, err);
        })


}

const nodemailer = require('nodemailer');

// eklerle birlikte mail gönderen async method
const sendMail = async (toAddress, subject, htmlMessage, attachments, callbackFunc) => {
    try {

        const from = "system@a-plasltd.com.tr";
        const transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: from,
                pass: 'Ap458800'
            }
        });

        const mailOptions = {
            from: from, // sender address
            to: toAddress, // list of receivers
            subject: subject, // Subject line
            html: htmlMessage, // html body
            attachments: attachments
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                callbackFunc(err, null);
            } else {
                callbackFunc(null, info);
            }
        });

    } catch (err) {
        callbackFunc(err, null);
    }
}

// kullanıcı id ile personel bilgilerini getiren async method
const getUserInfoFromUserID = async (userID, callbackFunc) => {

    if (userID == undefined || userID == null) {
        callbackFunc(null, "Kullanıcı id boş olmamalı!!!");
    } else {

        db.sequelize.query("SELECT per.*, dept.adi as departmanAdi, CONCAT(adi, ' ', soyadi) as personelAdSoyad, lok.lokasyonAdi, lok.kullanimdaMi as lokasyonKullanimdaMi, gorev.adi as gorevi FROM kullanici as kul LEFT JOIN ik_personel_sicil AS per ON kul.ikPersonelSicilID = per.ikPersonelSicilID LEFT JOIN genel_departman AS dept ON dept.genelDepartmanID = per.genelDepartmanID LEFT JOIN personel_gorev as gorev ON gorev.personelGorevID = per.personelGorevID LEFT JOIN sirket_lokasyon as lok ON lok.sirketLokasyonID = per.sirketLokasyonID WHERE kul.kullaniciID = :userID AND kul.aktifMi = 1", {
            type: db.Sequelize.QueryTypes.SELECT, replacements: {
                userID: userID
            }
        })
            .then(users => {

                if (users.length == 1) {

                    const user = users[0];
                    callbackFunc(user, null);

                } else {
                    callbackFunc(null, "kullanıcı bulunamadı!!!");
                }

            })
            .catch(error => {
                callbackFunc(null, error);
            });

    }

}

// kullanıcının personel sicilID'si aracılığıyla userID'ni getiren async method
const getUserIDFromSicil = async (personelSicil, callbackFunc) => {


    if (personelSicil == null || personelSicil == undefined) {
        callbackFunc(null, "sicil id boş olmamalı!!");
    }

    db.sequelize.query("SELECT kul.kullaniciID as userid FROM ik_personel_sicil as per LEFT JOIN kullanici as kul WHERE per.ikPersonelSicilID = :sicilID", {
        type: db.Sequelize.QueryTypes.SELECT, replacements: {
            sicilID: personelSicil
        }
    })
        .then((degPers) => {
            if (degPers.length > 0) {

                callbackFunc(degPers[0].userid, null);

            } else {
                callbackFunc(null, "kullanıcı sicil numarası bulunamadı!");
            }

        })
        .catch(err => {
            callbackFunc(null, err)
        });

}

const mailKaydet = async (konu, kime, htmlMesaj, tarih, ekler, callbackFunc) => {

    db.mail_log.create({
        konu: konu,
        kime: kime,
        htmlMesaj: htmlMesaj,
        tarih: tarih,
        ekler: ekler
    }).then(d => {
        callbackFunc(d, null);

    }).catch(err => {
        callbackFunc(null, " mail bilgileri loga kaydedilirken hata oluştu. HATA: " + err)

    })

}

module.exports = {
    getPersonelMailFromSicil,
    getPersonelMailFromUserID,
    sendMail,
    createBildirim,
    getUserIDFromSicil,
    mailKaydet
};