'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_mal_alis_katalogu', {
        urunYonetimiMalAlisKataloguID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        urunYonetimiUreticiUrunID: DataTypes.INTEGER,
        tedarikciFirmaID: DataTypes.INTEGER,
        tedarikciUrunKodu: DataTypes.STRING,

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

        model.belongsTo(models.urun_yonetimi_uretici_urun, {
            foreignKey: 'urunYonetimiUreticiUrunID',
            targetKey: 'urunYonetimiUreticiUrunID'
        });

        model.belongsTo(models.tedarikci_firma, {
            foreignKey: 'tedarikciFirmaID',
            targetKey: 'tedarikciFirmaID'
        });

    };

    return model;

};