'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_urun_kapasite', {
        urunYonetimiUrunKapasiteID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        urunYonetimiUreticiUrunID: DataTypes.UUID,
        tedarikciFirmaID: DataTypes.UUID,
        tedarikciUrunKodu: DataTypes.STRING,
        kullaniciFirmaAdresID: DataTypes.UUID,
        baslangicTarihi: DataTypes.DATE,
        bitisTarihi: DataTypes.DATE,
        miktar: DataTypes.DECIMAL(10,3),

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

        model.belongsTo(models.urun_yonetimi_uretici_urun, {
            foreignKey: 'urunYonetimiUreticiUrunID',
            targetKey: 'urunYonetimiUreticiUrunID'
        });

        model.belongsTo(models.tedarikci_firma, {
            foreignKey: 'tedarikciFirmaID',
            targetKey: 'tedarikciFirmaID'
        });

        model.belongsTo(models.kullanici_firma_adres, {
            foreignKey: 'kullaniciFirmaAdresID',
            targetKey: 'kullaniciFirmaAdresID'
        });


    };

    return model;

};