const path = require("path");
const multer = require("multer");
const Sequelize = require('sequelize');
const dbConnections = require('../config/dbConnections');
const appDB = dbConnections.appDB;

// rastgele string üretme fonksiyonu
function random(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function apUploader(params = { req, iliskiliTablo, iliskiID, createdUserID, fileTypes, fileSize, fileFormName }) {
    // iliskiliTablo    => dosyanın bağlı olduğu tablo ismi
    // iliskiID         => dosyanın bağlı olduğu tablo ID
    // fileTypes    => yüklenebilecek dosya tipleri
    // fileSize     => yüklenecek dosyanın max boyutu
    // fileFormName => dosyanın formdaki name alanı
    // createdUserID    => kaydı oluşturan kullanıcı bilgisi

    return new Promise((resolve, reject) => {
        if (!params) {
            reject("apUploader eksik parametre hatası!");
            return;
        }

        if (!params.req) {
            reject("req boş olamaz!");
            return;
        }
        let req = params.req;

        if (!params.iliskiliTablo) {
            reject("iliskiliTablo boş olamaz!");
            return;
        }
        let iliskiliTablo = params.iliskiliTablo;

        if (!params.iliskiID) {
            reject("iliskiID boş olamaz!");
            return;
        }
        let iliskiID = params.iliskiID;

        // if (!params.createdUserID) {
        //   reject("createdUserID boş olamaz!");
        //   return;
        // }
        let createdUserID = params.createdUserID;

        // klasör yok ise multer otomatik olarak oluşturur.
        let destination = `./uploads/${iliskiliTablo}/${iliskiID}/`;
        // oluşturulacak olan dosyaya verilecek isim
        let filename = Date.now() + "-" + random(10);
        // maksimum dosya boyutu
        let fileSize = params.fileSize || 40 * 1000 * 1000;
        // file dosyasının post edildiği form etiketi
        let fileFormName = params.fileFormName || "files";
        // yüklenebilecek dosya tipleri
        let filetypes = params.fileTypes || null;

        const upload = multer({
            storage: multer.diskStorage({
                destination: destination,
                filename: function(req, file, cb) {
                    cb(null, filename)
                },
            }),
            limits: {
                fileSize: fileSize
            },
            fileFilter: function(req, file, cb) {
                if (filetypes) {
                    const filetypes = req.filetypes;
                    const mimetype = filetypes.test(file.mimetype);
                    const extname = filetypes.test(
                        path.extname(file.originalname).toLowerCase()
                    );

                    if (mimetype && extname) {
                        cb(null, true);
                    } else {
                        cb(`Sadece desteklenen tiplerdeki dosyaları yükleyebilirsiniz. - ${filetypes}`);
                    }

                } else {
                    cb(null, true);
                }

            },
        }).single(fileFormName);

        upload(req, "", (err) => {

            if (err instanceof multer.MulterError) {
                reject(`ERROR! Code: "${err.code}" Message: "${err.message}" Field: "${err.field}"`);
                return;
            } else if (err) {
                reject(err);
                return;
            }

            let file = req.file;

            appDB.query("INSERT INTO dosya (adi, turu, dosyaYolu, dosyaAdi, iliskiliTablo, iliskiID, createdUserID) VALUES (:adi, :turu, :dosyaYolu, :dosyaAdi, :iliskiliTablo, :iliskiID, :createdUserID)", {
                type: Sequelize.QueryTypes.INSERT,
                replacements: {
                    adi: file.originalname,
                    turu: file.mimetype,
                    dosyaYolu: file.destination,
                    dosyaAdi: file.filename,
                    iliskiliTablo: iliskiliTablo,
                    iliskiID: iliskiID,
                    createdUserID: createdUserID || null
                }
            }).then(() => {
                resolve();
            }).catch(err => {
                reject(err.message);
            });

        });
    });
}

module.exports = apUploader;