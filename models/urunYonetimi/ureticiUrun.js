'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_uretici_urun', {
        urunYonetimiUreticiUrunID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        adi: DataTypes.STRING,
        kodu: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
        kullaniciFirmaAdresID: DataTypes.UUID,
        genelUrunGrupID: DataTypes.UUID,
        genelUrunTurID: DataTypes.UUID,
        genelOlcuBirimiID: DataTypes.UUID,

        aktifMi: DataTypes.BOOLEAN,
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

        
        model.belongsTo(models.genel_olcu_birimi, {
            foreignKey: 'genelOlcuBirimiID',
            targetKey: 'genelOlcuBirimiID'
        });

    };

    return model;

};