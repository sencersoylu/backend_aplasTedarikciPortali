'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('siparis_yonetimi_kesin_siparis_detay', {
        siparisYonetimiKesinSiparisDetayID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        siparisYonetimiKesinSiparisID: DataTypes.INTEGER,
        siparisMiktari: DataTypes.DECIMAL(10,3),
        siparisTeslimTarihi: DataTypes.DATE,
        genelOlcuBirimiID: DataTypes.INTEGER,
        genelUrunTasiyiciID: DataTypes.INTEGER,
        urunYonetimiUreticiUrunID: DataTypes.INTEGER,
        tedarikciUrunKodu: DataTypes.STRING,
        stokAdi: DataTypes.STRING,
        stokKodu: DataTypes.STRING,

        sevkMiktari: DataTypes.DECIMAL(10,3),
        sevkTeslimTarihi: DataTypes.DATE,

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

        model.belongsTo(models.siparis_yonetimi_kesin_siparis, {
            foreignKey: 'siparisYonetimiKesinSiparisID',
            targetKey: 'siparisYonetimiKesinSiparisID'
        });

        model.belongsTo(models.urun_yonetimi_uretici_urun, {
            foreignKey: 'urunYonetimiUreticiUrunID',
            targetKey: 'urunYonetimiUreticiUrunID'
        });

        model.belongsTo(models.genel_olcu_birimi, {
            foreignKey: 'genelOlcuBirimiID',
            targetKey: 'genelOlcuBirimiID'
        });

        model.belongsTo(models.genel_urun_tasiyici, {
            foreignKey: 'genelUrunTasiyiciID',
            targetKey: 'genelUrunTasiyiciID'
        });

    };

    return model;

};