'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kalite_yonetimi_kalite_belgesi_ek', {

    kaliteYonetimiKaliteBelgesiEkID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    kaliteYonetimiKaliteBelgesiID: DataTypes.UUID,
    dosyaID: DataTypes.UUID,

    createdAt: {
      type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here

    tanim.belongsTo(models.kalite_yonetimi_kalite_belgesi, {
      foreignKey: 'kaliteYonetimiKaliteBelgesiID',
      targetKey: 'kaliteYonetimiKaliteBelgesiID'
    });

    tanim.belongsTo(models.dosya, {
      foreignKey: 'dosyaID',
      targetKey: 'dosyaID'
    });

  };

  return tanim;

};