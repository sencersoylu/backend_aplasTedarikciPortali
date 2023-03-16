'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('mail_log', {

    mailLogID: {
      type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,primaryKey: true
    },
    konu: DataTypes.TEXT,
    kime: DataTypes.TEXT,
    htmlMesaj: DataTypes.TEXT,
    gonderildiMi: DataTypes.BOOLEAN,
    gonderilmeTarihi: DataTypes.DATE,
    tarih: DataTypes.DATE,
    ekler: DataTypes.TEXT

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here


  };

  return tanim;

};