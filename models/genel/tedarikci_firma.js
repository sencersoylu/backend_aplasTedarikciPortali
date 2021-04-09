'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('tedarikci_firma', {
        tedarikciFirmaID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
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
        aktifMi: DataTypes.BOOLEAN,
        
        createdUserID: DataTypes.STRING,
        updatedUserID: DataTypes.STRING,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {
        
    };

    return model;

};