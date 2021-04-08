'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_grup', {

    kullaniciGrupID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    adi: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    aciklama: DataTypes.TEXT,
    createdUserID: DataTypes.STRING,
    updatedUserID: DataTypes.STRING,
    createdAt: {
        type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
        type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here


  };

  return tanim;

};