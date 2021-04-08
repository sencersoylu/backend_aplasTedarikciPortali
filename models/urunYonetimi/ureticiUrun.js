'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_uretici_urun', {
        urunYonetimiUreticiUrunID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        adi: DataTypes.STRING,
        kodu: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
        kullaniciFirmaAdresID: DataTypes.INTEGER,
        genelUrunGrupID: DataTypes.INTEGER,
        genelUrunTurID: DataTypes.INTEGER,
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

        model.belongsTo(models.genel_urun_grup, {
            foreignKey: 'genelUrunGrupID',
            targetKey: 'genelUrunGrupID'
        });

        model.belongsTo(models.genel_urun_tur, {
            foreignKey: 'genelUrunTurID',
            targetKey: 'genelUrunTurID'
        });

        model.belongsTo(models.kullanici_firma_adres, {
            foreignKey: 'kullaniciFirmaAdresID',
            targetKey: 'kullaniciFirmaAdresID'
        });

    };

    return model;

};