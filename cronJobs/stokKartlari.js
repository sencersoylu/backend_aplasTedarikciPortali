const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const table = "urun_yonetimi_uretici_urun";
const keyExpr = "urunYonetimiUreticiUrunID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her gün saat 09:00'da çalışacak cronJob:  D1 ve D2 deki stok kartlarını kontrol edilip portala aktarılmasını sağlayan senkronizasyon
module.exports = async function stokKartlari() {

    cron.schedule("00 09 * * *", async function () {

        try {

            // kesin siparişlere giren ürünler
            let eesQuery = `
        SELECT DISTINCT
            urun.STOKNO,
            urun.TEK_RESNO,
            urun.MLZ_ADI,
            urun.TURU,
            urun.GRUP,
            urun.OB_ISLEM,
            urun.PRC_AGIR,
            urun.PRC_HACIM,
            urun.PRC_EN,
            urun.PRC_BOY,
            urun.PRC_YUK
        FROM SIP_VER AS kesinSiparis
        INNER JOIN STK_MAS AS urun ON kesinSiparis.STK_MAS_KAY = urun.KAYITNO ORDER BY urun.MLZ_ADI ASC
                    `
            const d1Stoklari = await eesD1.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const d2Stoklari = await eesD2.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const mecutStoklar = await db.sequelize.query(`SELECT * FROM ${table}`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const urunGruplari = await db.sequelize.query(`SELECT * FROM genel_urun_grup`, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const urunTurleri = await db.sequelize.query(`SELECT * FROM genel_urun_tur`, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const olcuBirimleri = await db.sequelize.query(`SELECT * FROM genel_olcu_birimi`, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const findMatchItem  = (array, keyExpr, kod) => {

                const matchedRow = array.filter(g => g.kodu == kod);
                if(matchedRow.length > 0){
                    return matchedRow[0][keyExpr];
                }
                else{
                    return null;
                }
                
            }

            const silinecekler = [];
            const eklenecekler = [];
            const guncellenecekler = [];

            d1Stoklari.forEach(d1Stok => {

                const matchedStok = mecutStoklar.filter(stok => d1Stok.STOKNO == stok.urunKodu);
                d1Stok['kullaniciFirmaAdresID'] = "547dd4d6-3ba9-49f5-bded-58fd7a3dc2a1"; // d1 kullanıcı firma adres id

                if (matchedStok.length > 0) {
                    guncellenecekler.push(d1Stok);
                } else {
                    eklenecekler.push(d1Stok);
                }

            });

            d2Stoklari.forEach(d2Stok => {

                const matchedStok = mecutStoklar.filter(stok => d2Stok.STOKNO == stok.urunKodu);
                d2Stok['kullaniciFirmaAdresID'] = "30612299-241f-447e-8881-db060282aba9"; // d2 kullanıcı firma adres id

                if (matchedStok.length > 0) {
                    guncellenecekler.push(d2Stok);
                } else {
                    eklenecekler.push(d2Stok);
                }

            });

            mecutStoklar.forEach(stok => {

                const matchedStokD1 = d1Stoklari.filter(d1Stok => d1Stok.STOKNO == stok.urunKodu);
                const matchedStokD2 = d2Stoklari.filter(d2Stok => d2Stok.STOKNO == stok.urunKodu);

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
                stok['parcaEn'] = stok['PRC_EN'];
                stok['parcaBoy'] = stok['PRC_BOY'];
                stok['parcaYukseklik'] = stok['PRC_YUK'];
                stok['parcaHacim'] = stok['PRC_HACIM'];
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
                stok['parcaEn'] = stok['PRC_EN'];
                stok['parcaBoy'] = stok['PRC_BOY'];
                stok['parcaYukseklik'] = stok['PRC_YUK'];
                stok['parcaHacim'] = stok['PRC_HACIM'];
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