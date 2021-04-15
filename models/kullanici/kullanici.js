'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici', {

    kullaniciID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    kullaniciAdi: DataTypes.STRING,
    sifre: DataTypes.STRING,
    ePosta: DataTypes.STRING,
    sonGirisZamani: DataTypes.DATE,

    kisiAdi: DataTypes.STRING,
    kisiSoyadi: DataTypes.STRING,
    
    aktifMi: DataTypes.BOOLEAN,
    createdUserID: DataTypes.UUID,
    updatedUserID: DataTypes.UUID,
    createdAt: {
        type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
        type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },

  }, {});

  return tanim;

};