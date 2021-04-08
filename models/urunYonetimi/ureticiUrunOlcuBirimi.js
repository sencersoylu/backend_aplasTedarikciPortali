'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('urun_yonetimi_uretici_urun_olcu_birimi', {
        urunYonetimiUreticiUrunOlcuBirimiID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        urunYonetimiUreticiUrunID: DataTypes.INTEGER,
        genelOlcuBirimiID: DataTypes.INTEGER,
        varsayilanMi: DataTypes.BOOLEAN,
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

        model.belongsTo(models.genel_olcu_birimi, {
            foreignKey: 'genelOlcuBirimiID',
            targetKey: 'genelOlcuBirimiID'
        });

    };

    return model;

};