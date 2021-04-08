'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('tedarikci_firma_kullanici', {

    tedarikciFirmaKullaniciID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    kullaniciID: DataTypes.STRING,
    tedarikciFirmaID: DataTypes.INTEGER,

    createdUserID: DataTypes.STRING,
    updatedUserID: DataTypes.STRING,
    createdAt: {
        type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
        type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    }

  }, {});

  tanim.associate = function (models) {
    
    tanim.belongsTo(models.tedarikci_firma, {
      foreignKey: 'tedarikciFirmaID',
      targetKey: 'tedarikciFirmaID'
    });
    
  };

  return tanim;

};