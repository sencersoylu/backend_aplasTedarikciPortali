'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kullanici_grup_kullanici', {

    kullaniciGrupKullaniciID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    kullaniciGrupID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kullaniciID: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
    tanim.belongsTo(models.kullanici_grup, {
      foreignKey: 'kullaniciGrupID',
      targetKey: 'kullaniciGrupID'
    });

  };

  return tanim;

};