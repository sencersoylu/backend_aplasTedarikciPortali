'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_ulke', {
        genelUlkeID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        binaryCode: DataTypes.STRING(2),
        tripleCode: DataTypes.STRING(3),
        adi: DataTypes.STRING,
        telefonKodu: DataTypes.INTEGER,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    return model;

};