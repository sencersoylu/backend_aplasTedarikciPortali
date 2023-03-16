'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('kullanici_firma', {
        kullaniciFirmaID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        firmaAdi: DataTypes.STRING,
        firmaKodu: DataTypes.STRING,
        vergiDairesi: DataTypes.STRING,
        vergiNumarasi: DataTypes.STRING,
        telefon: DataTypes.STRING,
        faks: DataTypes.STRING,
        ePosta: DataTypes.STRING,
        kepAdresi: DataTypes.STRING,
        createdUserID: DataTypes.UUID,
        updatedUserID: DataTypes.UUID,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    

    return model;

};