'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('kalite_yonetimi_kalite_dokumani_ek', {

    kaliteYonetimiKaliteDokumaniEkID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    kaliteYonetimiKaliteDokumaniID: DataTypes.UUID,
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

    tanim.belongsTo(models.kalite_yonetimi_kalite_dokumani, {
      foreignKey: 'kaliteYonetimiKaliteDokumaniID',
      targetKey: 'kaliteYonetimiKaliteDokumaniID'
    });

    tanim.belongsTo(models.dosya, {
      foreignKey: 'dosyaID',
      targetKey: 'dosyaID'
    });

  };

  return tanim;

};