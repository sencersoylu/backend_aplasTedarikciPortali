'use strict';
module.exports = (sequelize, DataTypes) => {

    // taşıyıcı/kasa/paket tanımı
    const model = sequelize.define('genel_urun_tasiyici', {
        genelUrunTasiyiciID: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        kodu: DataTypes.STRING,
        adi: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
        genelUrunTasiyiciTuruID: DataTypes.UUID,
        tasiyiciIciMiktar: DataTypes.INTEGER,
        ambalajEn: DataTypes.DECIMAL(10, 3),
        ambalajBoy: DataTypes.DECIMAL(10, 3),
        ambalajYukseklik: DataTypes.DECIMAL(10, 3),
        ambalajAgirlikNet: DataTypes.DECIMAL(10, 3),
        ambalajAgirlikBrut: DataTypes.DECIMAL(10, 3),
        ambalajHacim: DataTypes.DECIMAL(10, 3),
        urunYonetimiUreticiUrunID: DataTypes.UUID,
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

        model.belongsTo(models.urun_yonetimi_uretici_urun, {
            foreignKey: 'urunYonetimiUreticiUrunID',
            targetKey: 'urunYonetimiUreticiUrunID'
        });

    };

    return model;

};