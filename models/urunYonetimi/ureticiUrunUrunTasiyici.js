'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_uretici_urun_urun_tasiyici', {
        urunYonetimiUreticiUrunUrunTasiyiciID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        urunYonetimiUreticiUrunID: DataTypes.UUID,
        genelUrunTasiyiciID: DataTypes.UUID,
        varsayilanMi: DataTypes.BOOLEAN,
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

        model.belongsTo(models.genel_urun_tasiyici, {
            foreignKey: 'genelUrunTasiyiciID',
            targetKey: 'genelUrunTasiyiciID'
        });

    };

    return model;

};