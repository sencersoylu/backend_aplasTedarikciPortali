'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_firma_teslim_yeri', {

    kullaniciFirmaTeslimYeriID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    kullaniciFirmaAdresID: DataTypes.UUID,
    kullaniciFirmaID: DataTypes.UUID,

    adi: DataTypes.STRING,
    aciklama: DataTypes.TEXT,
    varsayilanMi: DataTypes.BOOLEAN,
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