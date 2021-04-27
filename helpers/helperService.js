const db = require('../models');

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
    sendMail,
    createBildirim,
    mailKaydet
};