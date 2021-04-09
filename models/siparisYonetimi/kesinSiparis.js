'use strict';
module.exports = (sequelize, DataTypes) => {

    // kesinleşmiş satınalma siparişi
    const model = sequelize.define('siparis_yonetimi_kesin_siparis', {

        siparisYonetimiKesinSiparisID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        siparisNo: DataTypes.STRING,
        siparisTarihi: DataTypes.DATE,
        not: DataTypes.TEXT,
        tedarikciFirmaID: DataTypes.INTEGER,
        ureticiFirmaID: DataTypes.INTEGER,
        cikisAdresi: DataTypes.TEXT,
        varisAdresi: DataTypes.TEXT,
        cikisAdresiID: DataTypes.INTEGER,
        varisAdresiID: DataTypes.INTEGER,
        tedarikciFirmaKodu: DataTypes.STRING,
        tedarikciFirmaAdi: DataTypes.STRING,
        ureticiFirmaKodu: DataTypes.STRING,
        ureticiFirmaAdi: DataTypes.STRING,
        siparisDurumID: DataTypes.INTEGER,

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

        model.belongsTo(models.tedarikci_firma, {
            foreignKey: 'tedarikciFirmaID',
            targetKey: 'tedarikciFirmaID'
        });

        model.belongsTo(models.kullanici_firma, {
            foreignKey: 'ureticiFirmaID',
            targetKey: 'kullaniciFirmaID'
        });

        model.belongsTo(models.tedarikci_firma_adres, {
            foreignKey: 'cikisAdresiID',
            targetKey: 'tedarikciFirmaAdresID'
        });

        model.belongsTo(models.kullanici_firma_adres, {
            foreignKey: 'varisAdresiID',
            targetKey: 'kullaniciFirmaAdresID'
        });

        model.belongsTo(models.siparis_yonetimi_kesin_siparis_durum, {
            foreignKey: 'siparisDurumID',
            targetKey: 'siparisYonetimiKesinSiparisDurumID'
        });

    };

    return model;

};