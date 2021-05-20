const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const table = "genel_urun_tasiyici";
const keyExpr = "genelUrunTasiyiciID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);

// henüz kod tamamlanmadı. güncellemen lazım!!!!

// her gün saat 09:00'da çalışacak cronJob:  D1 ve D2 deki MTA tanımlarını kontrol edilip portala aktarılmasını sağlayan senkronizasyon
module.exports = async function malzemeTasiyicilari() {

    cron.schedule("00 09 * * *", async function () {

        try {

            let eesQuery = `
        SELECT
            mta.MTA_STKNO,
            mta.MLZ_MIKTAR,
            urun.AMBALAJ_BRM,
            urun.STOKNO,
            urun.MLZ_ADI
        FROM
            MLZ_MTA AS mta
        LEFT JOIN STK_MAS AS urun ON urun.KAYITNO = mta.STK_MAS_KAY
                    `
            const d1Tasiyicilari = await eesD1.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const d2Tasiyicilari = await eesD2.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const mevcutTasiyicilar = await db.sequelize.query(`SELECT * FROM ${table}`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const tasiyiciTurleri = await db.sequelize.query(`SELECT * FROM genel_urun_tasiyici_tur`, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const findMatchItem  = (kod) => {

                const matchedRow = tasiyiciTurleri.filter(g => g.kodu == kod);
                if(matchedRow.length > 0){
                    return matchedRow[0]['genelUrunTasiyiciTurID'];
                }
                else{
                    return null;
                }
                
            }

            const silinecekler = [];
            const eklenecekler = [];
            const guncellenecekler = [];

            d1Tasiyicilari.forEach(d1Stok => {

                const matchedStok = mevcutTasiyicilar.filter(stok => d1Stok.MTA_STKNO == stok.kodu);
                d1Stok['tasiyiciIciMiktar'] = d1Stok['MLZ_MIKTAR'];
                d1Stok['kodu'] = d1Stok['MTA_STKNO'];
                d1Stok['adi'] = d1Stok['STOKNO'] + "- TAŞIYICISI";
                d1Stok['aciklama'] = d1Stok['MLZ_ADI'] + "- taşıyıcısı";


                if (matchedStok.length > 0) {
                    guncellenecekler.push(d1Stok);
                } else {
                    eklenecekler.push(d1Stok);
                }

            });

            d2Tasiyicilari.forEach(d2Stok => {

                const matchedStok = mevcutTasiyicilar.filter(stok => d2Stok.MTA_STKNO == stok.kodu);
                d2Stok['tasiyiciIciMiktar'] = d2Stok['MLZ_MIKTAR'];
                d2Stok['kodu'] = d2Stok['MTA_STKNO'];
                d2Stok['adi'] = d2Stok['STOKNO'] + "- TAŞIYICISI";
                d2Stok['aciklama'] = d2Stok['MLZ_ADI'] + "- taşıyıcısı";

                if (matchedStok.length > 0) {
                    guncellenecekler.push(d2Stok);
                } else {
                    eklenecekler.push(d2Stok);
                }

            });

            mevcutTasiyicilar.forEach(stok => {

                const matchedStokD1 = d1Tasiyicilari.filter(d1Stok => d1Stok.MTA_STKNO == stok.kodu);
                const matchedStokD2 = d2Tasiyicilari.filter(d2Stok => d2Stok.MTA_STKNO == stok.kodu);

                if (matchedStokD1.length == 0 && matchedStokD2.length == 0) {
                    silinecekler.push(stok);
                }

            });


            async function addUrun(stok) {

                delete stok[keyExpr];

                stok['aktifMi'] = true;
                stok['adi'] = stok['MLZ_ADI'];
                stok['kodu'] = stok['STOKNO'];
                stok['teknikResimNo'] = stok['TEK_RESNO'];
                stok['parcaAgirlik'] = stok['PRC_AGIR'];
                stok['genelUrunGrupID'] = findMatchItem(urunGruplari, 'genelUrunGrupID',stok['GRUP'])
                stok['genelUrunTurID'] = findMatchItem(urunTurleri, 'genelUrunTurID',stok['TURU'])
                stok['genelOlcuBirimiID'] = findMatchItem(olcuBirimleri, 'genelOlcuBirimiID',stok['OB_ISLEM'])

                return db[table]
                    .create(stok);

            }

            async function deleteUrun(urun) {

                return db.sequelize.query(`UPDATE ${table} SET aktifMi = 0 WHERE ${keyExpr} = '${urun[keyExpr]}'`, {
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            }

            async function updateUrun(stok) {

                stok['aktifMi'] = true;
                stok['adi'] = stok['MLZ_ADI'];
                stok['kodu'] = stok['STOKNO'];
                stok['teknikResimNo'] = stok['TEK_RESNO'];
                stok['parcaAgirlik'] = stok['PRC_AGIR'];
                stok['genelUrunGrupID'] = findMatchItem(urunGruplari, 'genelUrunGrupID',stok['GRUP'])
                stok['genelUrunTurID'] = findMatchItem(urunTurleri, 'genelUrunTurID',stok['TURU'])
                stok['genelOlcuBirimiID'] = findMatchItem(olcuBirimleri, 'genelOlcuBirimiID',stok['OB_ISLEM'])

                return db[table]
                    .update(stok, {
                        where: {
                            [keyExpr]: stok[keyExpr]
                        }
                    });

            }

            return Promise.all(eklenecekler.map(urun => {
                return addUrun(urun);
            }))
                .then(() => {
                    return Promise.all(guncellenecekler.map(urun => {
                        return updateUrun(urun);
                    }))
                })
                .then(() => {
                    return Promise.all(silinecekler.map(urun => {
                        return deleteUrun(urun);
                    }))
                })
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