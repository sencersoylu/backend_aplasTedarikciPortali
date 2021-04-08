const Sequelize = require('sequelize');
const dbConnections = require('../config/dbConnections');
const appDB = dbConnections.appDB;
const config = require('../config/config.json');
const fs = require('fs');

let dirname;
if (config.startupMode == "test") {
    dirname = config.test.apDownloaderPath;
} else if (config.startupMode == "production") {
    dirname = config.production.apDownloaderPath;
}


function textClear(char) {
    // replace chars from start and end, except strings and numbers...
    char = char.replace(/^[^a-zA-Z0-9]*/, "");
    char = char.replace(/[^a-zA-Z0-9]*$/, "");

    return char;
}

function f_ensureExist(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.F_OK, (err) => {
            if (err) {
                reject("Dosya bulunamadı!");
            } else {
                //file exists
                resolve();
            }
        })
    })
}

function apDownloader(dosyaID) {
    return new Promise(async(resolve, reject) => {
        try {

            if (!dosyaID) {
                throw "dosyaID boş olamaz!";
            }

            let datas = await appDB.query("SELECT * FROM dosya WHERE dosyaID=:dosyaID", {
                type: Sequelize.QueryTypes.SELECT,
                replacements: {
                    dosyaID: dosyaID
                }
            }).catch(err => {
                throw err.message;
            });

            let data = datas[0];

            if (!data) {
                throw "Kayıt Bulunamadı!";
            }

            if (!data.dosyaYolu) {

                const base64data = Buffer.from(data.icerik).toString('base64');

                resolve({
                    content: base64data,
                    type: data.turu,
                    name: data.adi,
                    filePath: null
                });

                return;
                // throw "dosyaYolu boş olamaz!";
            }

            if (!data.dosyaAdi) {
                throw "dosyaAdi boş olamaz!";
            }

            data.dosyaYolu = textClear(data.dosyaYolu);
            data.dosyaAdi = textClear(data.dosyaAdi);

            const filePath = `${dirname}/${data.dosyaYolu}/${data.dosyaAdi}`;

            await f_ensureExist(filePath);

            resolve({
                content: null,
                type: data.turu,
                name: data.adi,
                filePath: filePath
            });

        } catch (err) {
            reject(err);
        }

    })
}

module.exports = apDownloader;