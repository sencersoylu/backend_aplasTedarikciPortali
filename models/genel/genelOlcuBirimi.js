'use strict';
module.exports = (sequelize, DataTypes) => {

  const definition = sequelize.define('genel_olcu_birimi', {
    genelOlcuBirimiID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    kodu: DataTypes.STRING,
    adi: DataTypes.STRING,
    createdAt: {
      type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    },
  }, {});

  return definition;

};