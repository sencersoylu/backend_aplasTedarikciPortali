////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// REQUIREMENTS
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const config = require("./config/config.json");
const appDB = require('./config/dbConnections.js').appDB;
const jwt = require('jsonwebtoken');

require('./models');

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// APP CONFIGS
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'enctype'],
    exposedHeaders: ['Content-Disposition', 'ap-file-name'],
}));
// for parsing application/json
app.use(express.json());
// for parsing application/xwww-
app.use(express.urlencoded({
      extended: true
}));

require("./cronJobs");

// for parsing multipart/form-data
app.use(express.static('public'));

const RSA_PRIVATE_KEY = fs.readFileSync('./private.key', 'utf8');

app.get('/appVersionCheck', async function(req, res) {
    try {
        let appVersion = req.query.appVersion;
        let status = false;

        if (appVersion === config.appVersion) {
            status = true;
        }

        res.status(200).json({
            status: status,
            appVersion: config.appVersion
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

app.post('/login', async function(req, res) {

    const filterData = req.body;

    const userName = filterData.username; // sicilNo da olabiliyor!
    const password = filterData.password;

    if (!userName) {
        res.status(400).json({
            validationError: "kullanıcı adı boş olmamalı!"
        });
        return;
    }

    if (!password) {
        res.status(400).json({
            validationError: "şifre boş olmamalı!"
        });
        return;
    }

    try {

        const users = await appDB.query(`
        
SELECT
	CONCAT(t.kisiAdi, ' ', t.kisiSoyadi) AS kisiAdSoyad,
	t.kullaniciID,
	t.sonGirisZamani,
    (CASE WHEN kfk.kullaniciFirmaKullaniciID IS NULL AND tfk.tedarikciFirmaKullaniciID IS NULL THEN NULL WHEN tfk.tedarikciFirmaKullaniciID IS NULL THEN 1 ELSE 2  END) as firmaTipID,
    (CASE WHEN kf.kullaniciFirmaID IS NULL AND tf.tedarikciFirmaID IS NULL THEN NULL WHEN tf.tedarikciFirmaID IS NULL THEN kf.kullaniciFirmaID ELSE tf.tedarikciFirmaID  END) as firmaID
FROM
	kullanici AS t
LEFT JOIN kullanici_firma_kullanici as kfk ON kfk.kullaniciID = t.kullaniciID
LEFT JOIN kullanici_firma as kf ON kf.kullaniciFirmaID = kfk.kullaniciFirmaID

LEFT JOIN tedarikci_firma_kullanici as tfk ON tfk.kullaniciID = t.kullaniciID
LEFT JOIN tedarikci_firma as tf ON tf.tedarikciFirmaID = tfk.tedarikciFirmaID

WHERE
	t.kullaniciAdi = :username
AND t.sifre = :password
AND t.aktifMi = 1
        
        `, {
            type: appDB.QueryTypes.SELECT,
            replacements: {
                username: userName,
                password: password
            }
        });


        if (users.length > 1) {
            res.status(400).json({
                validationError: "eşleşen birden çok kayıt mevcut!"
            });
            return;
        }

        if (users.length == 1) {
            const user = users[0];

            const jwtBearerToken = jwt.sign({
                isAuthenticated: true,
                user: {
                    kisiAdSoyad: user.kisiAdSoyad,
                    userGUID: user.kullaniciID,
                    LastLogin: user.sonGirisZamani,
                    genelFirmaTurID: user.firmaTipID, // 1: üretici , 2: tedarikçi
                    genelFirmaID: user.firmaID
                }
            }, RSA_PRIVATE_KEY, {
                algorithm: 'RS256',
                expiresIn: '1h'
            });

            res.json({
                jwtBearer: jwtBearerToken
            });

            await appDB.query("UPDATE kullanici SET sonGirisZamani = NOW() WHERE kullaniciID = :userID", {
                type: appDB.QueryTypes.UPDATE,
                replacements: {
                    userID: user.kullaniciID
                }
            });
        } else {
            res.status(401).json({
                validationError: "kullanıcı adı veya şifre hatalı!"
            });
        }



    } catch (e) {
        res.status(400).json(e);
    }




});

const httpServer = http.createServer(app);
httpServer.listen(config[config.startupMode].apiPort);

const allRoutes = require('./routes');
app.use(allRoutes);

module.exports = {};