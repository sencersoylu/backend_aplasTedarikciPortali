'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('genel_islem_grup_kullanici', {

    genelIslemGrupKullaniciID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    genelIslemGrupID: {
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
    }

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here
    tanim.belongsTo(models.genel_islem_grup, {
      foreignKey: 'genelIslemGrupID',
      targetKey: 'genelIslemGrupID'
    });

    tanim.belongsTo(models.kullanici, {
      foreignKey: 'kullaniciID',
      targetKey: 'kullaniciID'
    });

  };

  return tanim;

};