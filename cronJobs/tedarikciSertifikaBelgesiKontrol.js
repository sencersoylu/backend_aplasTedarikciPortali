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


// her gün saat 09:00'da çalışacak cronJob:  kalite sertifikalarının olup olmadığı kontrol edilip tedarikçilere mail gönderilir.
module.exports = async function tedarikciler() {

    cron.schedule("00 09 * * *", async function () {

        try {

            const dokumanlar = await db.sequelize.query(`
            SELECT
                tur.kaliteYonetimiKaliteBelgesiTurID,
                tur.adi AS turAdi,
                guncelDok.tedarikciFirmaID,
                DATE_FORMAT(
                    dok.gecerlilikTarihi,
                    "%d.%m.%Y"
                ) AS gecerlilikTarihi
            FROM kalite_yonetimi_kalite_belgesi_tur AS tur
            LEFT JOIN
                (
                    SELECT
                        tedarikciFirmaID,
                        kaliteYonetimiKaliteBelgesiTurID,
                        MAX(createdAt) AS guncelBelgeOlusmaZamani
                    FROM
                        kalite_yonetimi_kalite_belgesi
                    GROUP BY
                        tedarikciFirmaID,
                        kaliteYonetimiKaliteBelgesiTurID
                ) AS guncelDok ON tur.kaliteYonetimiKaliteBelgesiTurID = guncelDok.kaliteYonetimiKaliteBelgesiTurID
            LEFT JOIN kalite_yonetimi_kalite_belgesi AS dok ON dok.createdAt = guncelDok.guncelBelgeOlusmaZamani
            AND guncelDok.kaliteYonetimiKaliteBelgesiTurID = tur.kaliteYonetimiKaliteBelgesiTurID
            AND guncelDok.tedarikciFirmaID = dok.tedarikciFirmaID
            LEFT JOIN kalite_yonetimi_kalite_belgesi_ek AS ek ON ek.kaliteYonetimiKaliteBelgesiID = dok.kaliteYonetimiKaliteBelgesiID
            WHERE
                tur.zorunluMu = 1 AND (guncelDok.tedarikciFirmaID IS NULL OR ek.kaliteYonetimiKaliteBelgesiEkID IS NULL)
                    `, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            if (dokumanlar.length > 0) {

                const sendMail = async (dokuman) => {

                    const userMails = await db.sequelize.query("SELECT ePosta FROM kullanici as k INNER JOIN tedarikci_firma_kullanici as ik ON ik.kullaniciID = k.kullaniciID INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = ik.tedarikciFirmaID WHERE ik.tedarikciFirmaID = :tedarikciID", {
                        type: db.Sequelize.QueryTypes.SELECT,
                        replacements: {
                            tedarikciID: dokuman['tedarikciFirmaID']
                        }
                    });

                    if (userMails.length > 0) {
                        let toAddress = userMails.map(m => m.ePosta).toString(); // comma seperated
                        let subject = 'A-PLAS Tedarikçi Portalı: Kalite Sertifikası Hatırlatması';
                        let htmlMessage = `'${dokuman['turAdi']}' sertifikanız bulunmamaktadır. Lütfen en yakın zamanda güncel dökümanı sisteme yükleyiniz.`;
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

                return Promise.all(dokumanlar.map(dok => {
                    return sendMail(dok)
                }));


            }


        }
        catch (err) {
            console.error(err);
            log.error(err);
        }


    });

}