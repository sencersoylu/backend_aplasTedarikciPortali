const db = require('../models');
const cron = require('node-cron');
const helperService = require("../helpers/helperService");
const logger = require('simple-node-logger');

const path = require('path');
const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her 1 dk da bir mail loglarındaki mailleri  gönderen ve gönderim durumunu güncelleyen cronjob
module.exports = function sendMail() {

    let isMailSending = false;
    cron.schedule("0 */1 * * * *", async function () {
        try {
            log.info("mail cronjob çalışıyor.", isMailSending);

            if (isMailSending) {
                log.info("mail gönderme devam ettiği için işlem sonlandırıldı.");
                return;
            }

            log.info("mailLog bilgisi alınıyor...");
            const mailLogs = await db.sequelize.query("SELECT * FROM mail_log WHERE (gonderildiMi IS NULL OR gonderildiMi = 0 ) ORDER BY mailLogID ASC", {
                type: db.Sequelize.QueryTypes.SELECT
            }).catch(() => {
                throw "mailLog bilgisi alınırken hata ile karşılaşıldı!";
            });

            log.info("mailLog bilgisi alındı.", mailLogs.length);
            if (mailLogs.length === 0) {
                throw "Gönderilecek mail kaydı bulunamadı.";
            }

            isMailSending = true;

            for (let i = 0; i < mailLogs.length; i++) {
                // aşağıda alınacak herhangi bir hatada bir sonraki maile geçiş engellenmemesi için try catch yapıldı.
                try {
                    let mailLog = mailLogs[i];
                    let jsonEkler = [];

                    if (mailLog.ekler) {
                        log.info("ek içerikleri buffer a çevriliyor...");

                        jsonEkler = JSON.parse(mailLog.ekler);

                        jsonEkler.forEach(ek => {
                            if (ek.content) {
                                ek.content = Buffer.from(ek.content, 'utf8'); // string to buffer
                            }
                        });

                        log.info("ek içerikleri buffer a çevrildi");
                    }

                    await new Promise(async (resolve, reject) => {
                        log.info("mail gönderme işlemi başlatılıyor... mailLogID: ", mailLog.mailLogID);
                        await helperService.sendMail(mailLog.kime, mailLog.konu, mailLog.htmlMesaj, jsonEkler, async (err, info) => {
                            if (err) {
                                reject("Mail gönderme işlemi sırasında hata ile karşılaşıldı! HATA:", err);
                            }
                            if (info) {
                                log.info("mail gönderildi olarak işaretleniyor... MailLogID:", mailLog.mailLogID);
                                await db.sequelize.query("UPDATE mail_log SET gonderildiMi = 1 , gonderilmeTarihi = NOW() WHERE mailLogID = '" + mailLog.mailLogID+ "'", {
                                    type: db.Sequelize.QueryTypes.UPDATE
                                }).catch(() => {
                                    reject("mail gönderildi işaretleme sırasında hata ile karşılaşıldı! MailLogID:" + mailLog.mailLogID);
                                });

                                log.info("mail gönderme işlemi başarıyla tamamlandı. MailLogID:", mailLog.mailLogID);
                                resolve();
                            }
                        });
                    });
                } catch (err) {
                    log.info(err);
                }
            }

            isMailSending = false;

        } catch (err) {
            log.info("İşlem sonlandırıldı => MESAJ:", err);
            isMailSending = false;
        }

        log.info("mail cronjob tamamlandı.");

    });

}