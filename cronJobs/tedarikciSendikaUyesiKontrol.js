const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her gün saat 09:00'da çalışacak cronJob:  sendika üyesi olupta üyelik formunu yüklemeyen tedarikçiler kontrol edilip ilgililerine mail gönderilir.
module.exports = async function sendikaUyesiTedarikciler() {

    cron.schedule("00 09 * * *", async function () {

        try {

            const tedarikciler = await db.sequelize.query(`
        SELECT
            ted.*
        FROM
            tedarikci_firma AS ted
        LEFT JOIN kalite_yonetimi_dokumani as dok
        LEFT JOIN kalite_yonetimi_dokumani_ek AS dokEk ON dokEk.kaliteYonetimiKaliteDokumaniID = dok.kaliteYonetimiKaliteDokumaniID
        WHERE ted.sendikaUyesiMi = 1 AND dok.kaliteYonetimiKaliteDokumaniTurID = 1 AND dokEk.kaliteYonetimiKaliteDokumaniID IS NULL
            `, {
                type: db.Sequelize.QueryTypes.SELECT
            });


            const sendMailTedarikciBakiyeHatirlatmasi = async (tedarikci) => {

                // ilgili tedarikçi firma kullanılarına bakiye hatırlatması mail bilgisi gönderiliyor
                const userMails = await db.sequelize.query("SELECT ePosta FROM kullanici as k INNER JOIN tedarikci_firma_kullanici as ik ON ik.kullaniciID = k.kullaniciID INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = ik.tedarikciFirmaID WHERE ik.tedarikciFirmaID = :tedarikciID", {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        tedarikciID: tedarikci['tedarikciFirmaID']
    }
                });

                const customDateFormat = (tarih) => {
                    return moment(tarih).format("DD.MM.YYYY");
                }

                if (userMails.length > 0) {
                    let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                    let subject = 'A-PLAS Tedarikçi Portalı: Sendika Üyelik Formu Hatırlatması';
                    let htmlMessage = "Sendika üyesi olmanıza rağmen henüz Sendika Üyelik Formu'nuzu yüklememiş bulunmaktasınız. Lütfen en yakın zamanda bu dökümanı sisteme yükleyiniz.";
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

            if (tedarikciler.length > 0) {

                Promise.all(tedarikciler.map(kalem => {
                    return sendMailTedarikciBakiyeHatirlatmasi(kalem);
                }))
                .catch(e => {
                    log.error(e);
                })


            }


        }
        catch (err) {
            console.error(err);
            log.error(err);
        }


    });

}