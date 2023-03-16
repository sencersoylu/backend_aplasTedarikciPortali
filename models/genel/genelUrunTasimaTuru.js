'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_urun_tasima_turu', {
        genelUrunTasimaTuruID: {
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

    return model;

};