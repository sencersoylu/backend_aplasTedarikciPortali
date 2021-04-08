'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici', {

    kullaniciID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    kullaniciUUID: {
      type: DataTypes.STRING(36), // UUID4
      allowNull: false,
      unique: true
    },
    kullaniciAdi: DataTypes.STRING,
    sifre: DataTypes.STRING,
    ePosta: DataTypes.STRING,
    sonGirisZamani: DataTypes.DATE,

    kisiAdi: DataTypes.STRING,
    kisiSoyadi: DataTypes.STRING,
    
    aktifMi: DataTypes.BOOLEAN,
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