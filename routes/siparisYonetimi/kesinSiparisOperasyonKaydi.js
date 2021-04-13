const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis_hareket";


const operasyonHareketiEkle = async (siparisID, operasyonID, req, aciklama = null) => {

    return db[table].create({
        createdUserID: req.body.userData.userID,
        siparisYonetimiKesinSiparisOperasyonID: operasyonID,
        siparisYonetimiKesinSiparisID: siparisID,
        aciklama: aciklama
    });

}

module.exports = operasyonHareketiEkle;