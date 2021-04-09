'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('sevkiyat_yonetimi_irsaliye_detay', {
        sevkiyatYonetimiIrsaliyeDetayID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sevkiyatYonetimiIrsaliyeID: DataTypes.INTEGER,
        miktar: DataTypes.DECIMAL(10,3), // sevk miktarı
        genelOlcuBirimiID: DataTypes.INTEGER,
        urunYonetimiUreticiUrunID: DataTypes.INTEGER,

        tedarikciUrunKodu: DataTypes.STRING, // satıcı ürün kodu
        urunAdi: DataTypes.STRING, // alıcı ürün adı
        urunKodu: DataTypes.STRING, // alıcı ürün kodu

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

        model.belongsTo(models.sevkiyat_yonetimi_irsaliye, {
            foreignKey: 'sevkiyatYonetimiIrsaliyeID',
            targetKey: 'sevkiyatYonetimiIrsaliyeID'
        });

        model.belongsTo(models.genel_olcu_birimi, {
            foreignKey: 'genelOlcuBirimiID',
            targetKey: 'genelOlcuBirimiID'
        });

        model.belongsTo(models.urun_yonetimi_uretici_urun, {
            foreignKey: 'urunYonetimiUreticiUrunID',
            targetKey: 'urunYonetimiUreticiUrunID'
        });

    };

    return model;

};