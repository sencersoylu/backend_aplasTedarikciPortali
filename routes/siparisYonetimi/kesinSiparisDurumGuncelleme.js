const db = require('../../models');

const table = "siparis_yonetimi_kesin_siparis";
const keyExpr = "siparisYonetimiKesinSiparisID";


const durumGuncelle = async (siparisID, durumID, req) => {

    return db[table].update({
        updatedUserID: req.body.userData.userID,
        siparisDurumID: durumID,
    },
     {
        where: {
            [keyExpr]: siparisID
        }
    });

}

module.exports = durumGuncelle;