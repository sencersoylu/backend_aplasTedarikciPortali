'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_firma_kullanici', {

    kullaniciFirmaKullaniciID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    
    kullaniciID: DataTypes.UUID,
    kullaniciFirmaAdresID: DataTypes.UUID,
    kullaniciFirmaID: DataTypes.UUID,

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
    
    tanim.belongsTo(models.kullanici_firma_adres, {
      foreignKey: 'kullaniciFirmaAdresID',
      targetKey: 'kullaniciFirmaAdresID'
    });

    tanim.belongsTo(models.kullanici_firma, {
      foreignKey: 'kullaniciFirmaID',
      targetKey: 'kullaniciFirmaID'
    });

  };

  return tanim;

};