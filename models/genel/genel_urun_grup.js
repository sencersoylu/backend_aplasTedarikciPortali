'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_urun_grup', {
        genelUrunGrupID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        kodu: DataTypes.STRING,
        adi: DataTypes.STRING,
        aciklama: DataTypes.TEXT,
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