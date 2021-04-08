'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('sevkiyat_yonetimi_irsaliye_durum', {
        sevkiyatYonetimiIrsaliyeDurumID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        adi: DataTypes.STRING,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

    };

    return model;

};