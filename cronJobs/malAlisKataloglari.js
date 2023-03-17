const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const table = "urun_yonetimi_mal_alis_katalogu";
const keyExpr = "urunYonetimiMalAlisKataloguID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her gün saat 09:00'da çalışacak cronJob:  A1 ve A2 deki firmaların aldığı ürünleri kontrol edilip portala aktarılmasını sağlayan senkronizasyon
module.exports = async function malAlisKataloglari() {

    cron.schedule("00 09 * * *", async function () {

        try {

            let eesQuery = `
        SELECT
            firma.FIRMA_KODU,
            firma.CARI_FIR_KODU,
            firma.UNVAN,
            urun.STOKNO,
            urun.MLZ_ADI,
            alisKat.SIP_YUZDE,
            alisKat.MIN_SIPMIK,
            alisKat.REF_STKNO,
            alisKat.REF_ADI,
            alisKat.TED_STOKNO
        FROM
            (
                SELECT
                    MAX (KAYITNO) as KAYITNO
                FROM
                    ALIS_KAT
                GROUP BY
                    FIRMALAR_KAY,
                    STK_MAS_KAY
                    
            ) AS guncelAlisKat
        INNER JOIN ALIS_KAT AS alisKat ON guncelAlisKat.KAYITNO = alisKat.KAYITNO
        INNER JOIN STK_MAS AS urun ON alisKat.STK_MAS_KAY = urun.KAYITNO
        INNER JOIN FIRMALAR AS firma ON alisKat.FIRMALAR_KAY = firma.KAYITNO

                    `
            const d1Alislari = await eesD1.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const d2Alislari = await eesD2.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const mevcutAlislar = await db.sequelize.query(`SELECT t.*, urun.kodu, firma.firmaKodu FROM ${table} as t INNER JOIN tedarikci_firma as firma ON firma.tedarikciFirmaID = t.tedarikciFirmaID INNER JOIN urun_yonetimi_uretici_urun as urun ON urun.urunYonetimiUreticiUrunID = t.urunYonetimiUreticiUrunID`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const tedarikciFirmalar = await db.sequelize.query(`SELECT * FROM tedarikci_firma`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const stoklar = await db.sequelize.query(`SELECT * FROM urun_yonetimi_uretici_urun`, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const findMatchFirmaItem  = (kod) => {

                const matchedRow = tedarikciFirmalar.filter(g => g.firmaKodu == kod);
                if(matchedRow.length > 0){
                    return matchedRow[0]['tedarikciFirmaID'];
                }
                else{
                    return null;
                }
                
            }

            const findMatchStokItem  = (kod, lokasyonID) => {

                const matchedRow = stoklar.filter(g => g.kodu == kod && g.kullaniciFirmaAdresID == lokasyonID);
                if(matchedRow.length > 0){
                    return matchedRow[0]['urunYonetimiUreticiUrunID'];
                }
                else{
                    return null;
                }
                
            }

            const silinecekler = [];
            const eklenecekler = [];
            const guncellenecekler = [];
            const d1FirmAdresID = "547dd4d6-3ba9-49f5-bded-58fd7a3dc2a1";
            const d2FirmAdresID = "30612299-241f-447e-8881-db060282aba9";

            d1Alislari.forEach(d1Alis => {

                // aynı ürün ve firma için
                const matchedAlis = mevcutAlislar.filter(alis => d1Alis.STOKNO == alis.kodu && d1Alis.CARI_FIR_KODU == alis.firmaKodu);
                d1Alis['tedarikciFirmaID'] = findMatchFirmaItem(d1Alis.CARI_FIR_KODU);
                d1Alis['urunYonetimiUreticiUrunID'] = findMatchStokItem(d1Alis.STOKNO,d1FirmAdresID ); // d1 adresinde
                d1Alis['tedarikciUrunKodu'] = d1Alis['TED_STOKNO'];
                d1Alis['kullaniciFirmaAdresID'] = d1FirmAdresID;

                if (matchedAlis.length > 0) {
                    d1Alis[keyExpr] = matchedAlis[0][keyExpr];
                    guncellenecekler.push(d1Alis);
                } else {
                    if(d1Alis['urunYonetimiUreticiUrunID']){
                        eklenecekler.push(d1Alis);
                    }
                }

            });

            d2Alislari.forEach(d2Alis => {

                const matchedAlis = mevcutAlislar.filter(alis => d2Alis.STOKNO == alis.kodu && d2Alis.CARI_FIR_KODU == alis.firmaKodu );
                d2Alis['tedarikciFirmaID'] = findMatchFirmaItem(d2Alis.CARI_FIR_KODU);
                d2Alis['urunYonetimiUreticiUrunID'] = findMatchStokItem(d2Alis.STOKNO,d2FirmAdresID); // d2 adresinde
                d2Alis['tedarikciUrunKodu'] = d2Alis['TED_STOKNO'];
                d2Alis['kullaniciFirmaAdresID'] = d2FirmAdresID;


                if (matchedAlis.length > 0) {
                    d2Alis[keyExpr] = matchedAlis[0][keyExpr];
                    guncellenecekler.push(d2Alis);
                } else {
                    if(d2Alis['urunYonetimiUreticiUrunID']){
                        eklenecekler.push(d2Alis);
                    }
                }

            });

            mevcutAlislar.forEach(alis => {

                const matchedAlisD1 = d1Alislari.filter(d1Alis => d1Alis.STOKNO == alis.kodu && d1Alis.CARI_FIR_KODU == alis.firmaKodu);
                const matchedAlisD2 = d2Alislari.filter(d2Alis => d2Alis.STOKNO == alis.kodu && d2Alis.CARI_FIR_KODU == alis.firmaKodu);

                if (matchedAlisD1.length == 0 && matchedAlisD2.length == 0) {
                    silinecekler.push(alis);
                }

            });


            async function addAlis(alis) {

                delete alis[keyExpr];

                return db[table]
                    .create(alis);

            }

            async function deleteAlis(alis) {

                return db.sequelize.query(`DELETE FROM ${table} WHERE ${keyExpr} = '${alis[keyExpr]}'`, {
                    type: db.Sequelize.QueryTypes.DELETE
                });

            }

            async function updateAlis(alis) {

                return db[table]
                    .update(alis, {
                        where: {
                            [keyExpr]: alis[keyExpr]
                        }
                    });

            }

            return Promise.all(eklenecekler.map(alis => {
                return addAlis(alis);
            }))
                .then(() => {
                    return Promise.all(guncellenecekler.map(alis => {
                        return updateAlis(alis);
                    }))
                })
                .then(() => {
                    return Promise.all(silinecekler.map(alis => {
                        return deleteAlis(alis);
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