'use strict';
module.exports = (sequelize, DataTypes) => {

    // ees'deki ambalaj türlerine karşılık geliyor
    const model = sequelize.define('genel_urun_tasiyici_turu', {
        genelUrunTasiyiciTuruID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        kodu: DataTypes.STRING,
        adi: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    return model;

};