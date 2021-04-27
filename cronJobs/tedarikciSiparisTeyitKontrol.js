const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

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


// her gün saat 09:00'da çalışacak cronJob:  D1 ve D2 deki siparişleri kontrol edilip tedarikçi tarafından teyit verilmeyen siparişler için mail atar.
module.exports = async function teyitVerilmeyenSiparisler() {

    cron.schedule("00 09 * * *", async function () {

        try {
            const teyitEdilmeyenSiparisler = await db.sequelize.query(`SELECT * FROM ${table} as sip LEFT JOIN (
                SELECT
                    MAX(siparisYonetimiKesinSiparisOperasyonID) as siparisYonetimiKesinSiparisOperasyonID,
                    ${keyExpr}
                FROM
                    siparis_yonetimi_kesin_siparis_hareket
                GROUP BY
                    ${keyExpr}
            ) AS sonHar ON sonHar.${keyExpr} = t.${keyExpr} WHERE sonHar.siparisYonetimiKesinSiparisOperasyonID IN (3)`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const sendMailTedarikciBakiyeHatirlatmasi = async (siparis) => {

                // ilgili tedarikçi firma kullanılarına bakiye hatırlatması mail bilgisi gönderiliyor
                const userMails = await db.sequelize.query("SELECT ePosta FROM kullanici as k INNER JOIN tedarikci_firma_kullanici as ik ON ik.kullaniciID = k.kullaniciID INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = ik.tedarikciFirmaID WHERE ik.tedarikciFirmaID = :tedarikciID", {
                    type: db.Sequelize.QueryTypes.SELECT,
                    replacements: {
                        tedarikciID: siparis['tedarikciFirmaID']
                    }
                });

                const customDateFormat = (tarih) => {
                    return moment(tarih).format("DD.MM.YYYY");
                }

                if (userMails.length > 0) {
                    let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                    let subject = 'A-PLAS Tedarikçi Portalı: Teyit Edilmeyen Sipariş Hatırlatması';
                    let htmlMessage = "'" + siparis['ureticiFirmaAdi'] + "' tarafından firmanıza açılan sipariş firmanızca hala teyit edilmemiştir. Lütfen ilgili siparişi teyit ediniz.<br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparis[keyExpr] + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(siparis['siparisTarihi']) + "</strong> ";
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

            Promise.all(teyitEdilmeyenSiparisler.map(siparis => {
                return sendMailTedarikciBakiyeHatirlatmasi(siparis);
            }))
                .catch(e => {
                    log.error(e);
                })

        }
        catch (err) {
            console.error(err);
            log.error(err);
        }


    });

}