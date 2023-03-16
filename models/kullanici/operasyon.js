'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('operasyon', {

    operasyonID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    adi: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    createdAt: {
        type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
        type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },

  }, {});

  return tanim;

};