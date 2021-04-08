'use strict';
module.exports = (sequelize, DataTypes) => {

    // taşıyıcı/kasa/paket tanımı
    const model = sequelize.define('genel_urun_tasiyici', {
        genelUrunTasiyiciID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        kodu: DataTypes.STRING,
        adi: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
        genelUrunTasiyiciTuruID: DataTypes.INTEGER,
        tasiyiciIciMiktar: DataTypes.INTEGER,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

        model.belongsTo(models.genel_urun_tasiyici_turu, {
            foreignKey: 'genelUrunTasiyiciTuruID',
            targetKey: 'genelUrunTasiyiciTuruID'
        });

    };

    return model;

};