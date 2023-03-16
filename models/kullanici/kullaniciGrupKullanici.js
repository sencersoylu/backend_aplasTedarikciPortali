'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_grup_kullanici', {

    kullaniciGrupKullaniciID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    kullaniciGrupID: {
      type: DataTypes.UUID,
      allowNull: false
    },
    kullaniciID: {
      type: DataTypes.UUID,
      allowNull: false
    },
    createdUserID: DataTypes.UUID,
    updatedUserID: DataTypes.UUID,
    createdAt: {
        type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
        type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here
    tanim.belongsTo(models.kullanici_grup, {
      foreignKey: 'kullaniciGrupID',
      targetKey: 'kullaniciGrupID'
    });

    tanim.belongsTo(models.kullanici, {
      foreignKey: 'kullaniciID',
      targetKey: 'kullaniciID'
    });

  };

  return tanim;

};