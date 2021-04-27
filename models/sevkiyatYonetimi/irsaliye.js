'use strict';
module.exports = (sequelize, DataTypes) => {

    // kesinleşmiş satınalma siparişine ait sevk irsaliyesi
    const model = sequelize.define('sevkiyat_yonetimi_irsaliye', {

        sevkiyatYonetimiIrsaliyeID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        irsaliyeNo: DataTypes.STRING,
        sevkTarihi: DataTypes.DATE,
        sevkiyatYonetimiIrsaliyeDurumID: DataTypes.INTEGER,
        siparisYonetimiKesinSiparisID: DataTypes.UUID,
        siparisNo: DataTypes.STRING, // ees deki siparis no
        siparisTarihi: DataTypes.DATE,
        not: DataTypes.TEXT,
        tedarikciFirmaID: DataTypes.UUID,
        ureticiFirmaID: DataTypes.UUID,
        cikisAdresi: DataTypes.TEXT,
        varisAdresi: DataTypes.TEXT,
        cikisAdresiID: DataTypes.UUID,
        varisAdresiID: DataTypes.UUID,
        tedarikciFirmaKodu: DataTypes.STRING,
        tedarikciFirmaAdi: DataTypes.STRING,
        ureticiFirmaKodu: DataTypes.STRING,
        ureticiFirmaAdi: DataTypes.STRING,

        genelUrunTasimaTuruID: DataTypes.INTEGER,
        kargoTakipNo: DataTypes.STRING,
        surucuAdiSoyadi: DataTypes.STRING,
        surucuTelefonNo: DataTypes.STRING,
        aracPlakaNo: DataTypes.STRING,
        aracDorseNo: DataTypes.STRING,

        createdUserID: DataTypes.UUID,
        updatedUserID: DataTypes.UUID,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },

    }, {});

    model.associate = function (models) {

        model.belongsTo(models.siparis_yonetimi_kesin_siparis, {
            foreignKey: 'siparisYonetimiKesinSiparisID',
            targetKey: 'siparisYonetimiKesinSiparisID'
        });

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

        model.belongsTo(models.sevkiyat_yonetimi_irsaliye_durum, {
            foreignKey: 'sevkiyatYonetimiIrsaliyeDurumID',
            targetKey: 'sevkiyatYonetimiIrsaliyeDurumID'
        });

        model.belongsTo(models.genel_urun_tasima_turu, {
            foreignKey: 'genelUrunTasimaTuruID',
            targetKey: 'genelUrunTasimaTuruID'
        });

    };

    return model;

};