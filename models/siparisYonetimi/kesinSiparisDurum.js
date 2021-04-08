'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('siparis_yonetimi_kesin_siparis_durum', {
        siparisYonetimiKesinSiparisDurumID: {
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