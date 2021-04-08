'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('genel_islem_grup_kullanici', {

    genelIslemGrupKullaniciID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    genelIslemGrupID: {
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
    }

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here
    tanim.belongsTo(models.genel_islem_grup, {
      foreignKey: 'genelIslemGrupID',
      targetKey: 'genelIslemGrupID'
    });

  };

  return tanim;

};