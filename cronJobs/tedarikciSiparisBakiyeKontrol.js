const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const logger = require('simple-node-logger');

const table = "siparis_yonetimi_kesin_siparis_detay";
const keyExpr = "siparisYonetimiKesinSiparisDetayID";
const parentKeyExpr = "siparisYonetimiKesinSiparisID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her gün saat 09:00'da çalışacak cronJob:  D1 ve D2 deki siparişler kontrol edilip bakiyede kalan siparişleri tedarikçiye bildirir.
module.exports = async function siparisler() {

    cron.schedule("00 09 * * *", async function () {

        try {

            const siparisler = await db.sequelize.query(`
        SELECT
            sip.*
        FROM
            siparis_yonetimi_kesin_siparis AS sip
        INNER JOIN ${table} AS t ON sip.${parentKeyExpr} = t.${parentKeyExpr}
        LEFT JOIN (
            SELECT
                MAX(
                    siparisYonetimiKesinSiparisOperasyonID
                ) AS siparisYonetimiKesinSiparisOperasyonID,
                ${parentKeyExpr}
            FROM
                siparis_yonetimi_kesin_siparis_hareket
            GROUP BY
            ${parentKeyExpr}
        ) AS sonHar ON sonHar.${parentKeyExpr} = t.${parentKeyExpr}
        WHERE
            sonHar.siparisYonetimiKesinSiparisOperasyonID NOT IN (4, 7)
        AND t.bakiye > 0
        AND t.siparisTeslimTarihi < NOW()
        GROUP BY sip.${parentKeyExpr}
            `, {
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
                    let subject = 'A-PLAS Tedarikçi Portalı: Bakiye Hatırlatma';
                    let htmlMessage = "'" + siparis['ureticiFirmaAdi'] + "' tarafından firmanıza açılan siparişte henüz teslim edilmeyen (bakiyede kalan) ürünler bulunmaktadır. Lütfen bu ürünleri teslim ediniz. <br><br><u>Sipariş Bilgileri:</u><br>Sipariş Takip No: <strong>" + siparis[parentKeyExpr] + "</strong><br>Sipariş Tarihi: <strong>" + customDateFormat(siparis['siparisTarihi']) + "</strong> ";
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

            if (siparisler.length > 0) {

                Promise.all(siparisler.map(kalem => {
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