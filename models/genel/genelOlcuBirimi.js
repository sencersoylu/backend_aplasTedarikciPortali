'use strict';
module.exports = (sequelize, DataTypes) => {

  const definition = sequelize.define('genel_olcu_birimi', {
    genelOlcuBirimiID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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

  definition.associate = function (models) {
    // associations can be defined here
  };

  return definition;

};