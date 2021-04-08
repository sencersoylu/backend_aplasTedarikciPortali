'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_firma_kullanici', {

    kullaniciFirmaKullaniciID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    kullaniciID: DataTypes.STRING,
    kullaniciFirmaAdresID: DataTypes.INTEGER,
    kullaniciFirmaID: DataTypes.INTEGER,

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