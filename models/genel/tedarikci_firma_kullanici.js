'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('tedarikci_firma_kullanici', {

    tedarikciFirmaKullaniciID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true
    },

    kullaniciID: DataTypes.UUID,
    tedarikciFirmaID: DataTypes.UUID,

    createdUserID: DataTypes.UUID,
    updatedUserID: DataTypes.UUID,
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

    tanim.belongsTo(models.kullanici, {
      foreignKey: 'kullaniciID',
      targetKey: 'kullaniciID'
    });

  };

  return tanim;

};