const db = require('../models');
const path = require('path');
const cron = require('node-cron');
const dbConnections = require('../config/dbConnections');
const logger = require('simple-node-logger');

const eesD1 = dbConnections.eesD1;
const eesD2 = dbConnections.eesD2;

const table = "tedarikci_firma";
const keyExpr = "tedarikciFirmaID";

const currentFileName = path.basename(__filename, '.js');
const opts = {
    logFilePath: './logs/cronJobs/' + currentFileName + '.log',
    timestampFormat: 'DD.MM.YYYY HH:mm:ss.SSS'
};

const log = logger.createSimpleLogger(opts);


// her gün saat 09:00'da çalışacak cronJob:  UVT tarafından yazılan D1 ve D2 deki tedarikçi firmaları kontrol edilip portala aktarılmasını sağlayan senkronizasyon
module.exports = async function tedarikciFirmalar() {

    cron.schedule("00 09 * * *", async function () {

        try {

            let eesQuery = `
        SELECT DISTINCT
            firma.KAYITNO,
            firma.CARI_FIR_KODU,
            firma.FIRMA_KODU,
            firma.UNVAN,
                CONCAT (
                    firma.ADRES1,
                    ' ',
                    firma.ADRES2,
                    ' ',
                    firma.ADRES3
                ) AS adres,
                CONCAT (
                    firma.SEVK_ADR1,
                    ' ',
                    firma.SEVK_ADR2,
                    ' ',
                    firma.SEVK_ADR3
                ) AS sevkAdresi,
                firma.SEHIR,
                firma.ILCE,
                firma.ULKE_ADI,
                firma.VRG_DAIRE,
                firma.VRG_NO,
                firma.POSTA_KODU
        FROM
            FIRMALAR as firma
        INNER JOIN ALIS_KAT as alisKat ON firma.KAYITNO = alisKat.FIRMALAR_KAY
                    `
            // portaldaki D1 ve D2 deki firmaların kontrol edilip, portala aktarılmasını gerçekleştirir
            const resultD1 = await eesD1.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            });

            const resultD2 = await eesD2.query(eesQuery, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const result = await db.sequelize.query(`SELECT firma.* FROM ${table} as firma order by firma.firmaKodu`, {
                type: db.Sequelize.QueryTypes.SELECT
            })

            const silinecekler = [];
            const eklenecekler = [];
            const guncellenecekler = [];

            resultD1.forEach(firmaD1 => {

                const matchedFirma = result.filter(firma => firmaD1.CARI_FIR_KODU == firma.firmaKodu);

                if (matchedFirma.length > 0) {
                    guncellenecekler.push(firmaD1);
                } else {
                    eklenecekler.push(firmaD1);
                }

            });

            resultD2.forEach(firmaD2 => {

                const matchedFirma = result.filter(firma => firmaD2.CARI_FIR_KODU == firma.firmaKodu);

                if (matchedFirma.length > 0) {
                    guncellenecekler.push(firmaD2);
                } else {
                    eklenecekler.push(firmaD2);
                }

            });

            result.forEach(firma => {

                const matchedFirmaD1 = resultD1.filter(firmaD1 => firmaD1.CARI_FIR_KODU == firma.firmaKodu);
                const matchedFirmaD2 = resultD2.filter(firmaD2 => firmaD2.CARI_FIR_KODU == firma.firmaKodu);

                if (matchedFirmaD1.length == 0 && matchedFirmaD2.length == 0) {
                    silinecekler.push(firma);
                }

            });


            async function addFirma(firma) {
                delete firma[keyExpr];
                firma['aktifMi'] = true;
                firma['firmaAdi'] = firma['UNVAN'];
                firma['firmaKodu'] = firma['CARI_FIR_KODU'];
                firma['vergiDairesi'] = firma['VRG_DAIRE'];
                firma['vergiNumarasi'] = firma['VRG_NO'];

                return db[table]
                    .create(firma)
                    .then((result) => {
                        const createdFirma = JSON.parse(JSON.stringify(result));

                        let genelUlkeID = null;
                        switch (firma['ULKE_ADI']) {
                            case "ALMANYA":
                                genelUlkeID = "7b20baa6-32eb-43cd-af2f-87e99ac568f3";
                                break;
                            case "TÜRKİYE":
                                genelUlkeID = "99cce7dc-7fb4-4951-8e70-3c1ce6b83295";
                                break;
                            case "İTALYA":
                                genelUlkeID = "368e75fe-4458-4f5f-a1e2-b46448af6eb1";
                                break;
                            case "HOLLANDA":
                                genelUlkeID = "a51c024b-79cd-44b2-8d00-19576ca56dfc";
                                break;
                            case "MACARISTAN":
                                genelUlkeID = "4e54df7b-13df-4f44-8730-f693e427e546";
                                break;
                            case "KOREA":
                                genelUlkeID = "367495f7-b699-4c55-8e4e-5e9b71020865";
                                break; // Güney Kore
                            case "İNGİLTERE":
                                genelUlkeID = "2f8a8d7a-e57a-45f3-a787-5efde7189e89";
                                break; // Birleşik Krallık
                            case "CHİNA":
                                genelUlkeID = "ca3ffa5f-dbd2-48e3-8bbe-b81fe82d56a7";
                                break;
                            case "İSPANYA":
                                genelUlkeID = "b8ffb8b5-1a59-4689-abdf-bd885b3801a0";
                                break;
                            case "SLOVAKIA":
                                genelUlkeID = "b34d542c-fff5-47aa-b260-b49cd2a2481c";
                                break;
                            case "U.S.":
                                genelUlkeID = "2c902531-4885-41b8-9862-3f94015fc817";
                                break;
                            case "FRANSA":
                                genelUlkeID = "f5e80abf-4dfa-4c7f-8074-e8079858cfda";
                                break;
                            case "GERMANY":
                                genelUlkeID = "7b20baa6-32eb-43cd-af2f-87e99ac568f3";
                                break;
                            case "England":
                                genelUlkeID = "2f8a8d7a-e57a-45f3-a787-5efde7189e89";
                                break;
                            case "KANADA":
                                genelUlkeID = "348052eb-9735-41b1-827a-0f59e6dc6b9b";
                                break;
                            case "SWITZERLAND": // isviçre
                                genelUlkeID = "67087124-e17e-4133-a711-c47edd2605e2";
                                break;
                            case "BREZİLYA": 
                                genelUlkeID = "13d343bc-3d6c-4c2b-a0c7-ea399541081e";
                                break;
                            case "ÇEK CUMHURİYETİ": 
                                genelUlkeID = "762aa078-d393-42b2-8d24-aa9f7b268964";
                                break;
                            case "PORTEKİZ": 
                                genelUlkeID = "26a0b1e8-0529-48b2-ab59-d5797f73c36f";
                                break;
                            default: null;

                        }


                        return db.tedarikci_firma_adres
                            .create({
                                tedarikciFirmaID: createdFirma[keyExpr],
                                adres: firma['sevkAdresi'],
                                kisaKodu: firma['CARI_FIR_KODU'] + "-SEVK_ADR_1",
                                genelUlkeID: genelUlkeID,
                                genelIlID: null
                            })

                    });

            }

            async function deleteFirma(firma) {

                return db.sequelize.query(`UPDATE ${table} SET aktifMi = 0 WHERE ${keyExpr} = '${firma[keyExpr]}'`, {
                    type: db.Sequelize.QueryTypes.UPDATE
                });

            }

            async function updateFirma(firma) {

                firma['aktifMi'] = true;
                firma['firmaAdi'] = firma['UNVAN'];
                firma['firmaKodu'] = firma['CARI_FIR_KODU'];
                firma['vergiDairesi'] = firma['VRG_DAIRE'];
                firma['vergiNumarasi'] = firma['VRG_NO'];

                return db[table]
                    .update(firma, {
                        where: {
                            [keyExpr]: firma[keyExpr]
                        }
                    });

            }

            return Promise.all(eklenecekler.map(mak => {
                return addFirma(mak);
            }))
                .then(() => {
                    return Promise.all(guncellenecekler.map(mak => {
                        return updateFirma(mak);
                    }))
                })
                .then(() => {
                    return Promise.all(silinecekler.map(mak => {
                        return deleteFirma(mak);
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