'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_firma_adres', {

    kullaniciFirmaAdresID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    kullaniciFirmaID: DataTypes.INTEGER,
    genelUlkeID: DataTypes.INTEGER,
    genelIlID: DataTypes.INTEGER,
    adres: DataTypes.TEXT,
    kisaKodu: DataTypes.STRING,
    merkezAdresMi: DataTypes.BOOLEAN,
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
    
    tanim.belongsTo(models.kullanici_firma, {
      foreignKey: 'kullaniciFirmaID',
      targetKey: 'kullaniciFirmaID'
    });

    tanim.belongsTo(models.genel_ulke, {
      foreignKey: 'genelUlkeID',
      targetKey: 'genelUlkeID'
    });

    tanim.belongsTo(models.genel_il, {
      foreignKey: 'genelIlID',
      targetKey: 'genelIlID'
    });

  };

  return tanim;

};