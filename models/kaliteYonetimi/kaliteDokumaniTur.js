'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('kalite_yonetimi_kalite_dokumani_tur', {
        kaliteYonetimiKaliteDokumaniTurID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        adi: DataTypes.STRING,
        zorunluMu: DataTypes.BOOLEAN,
        aciklama: DataTypes.TEXT,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});



    return model;

};