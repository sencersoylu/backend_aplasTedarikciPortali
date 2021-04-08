'use strict';
module.exports = (sequelize, DataTypes) => {

  const definition = sequelize.define('genel_para_birimi', {
    genelParaBirimiID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ad: DataTypes.STRING,
    kisaAd: DataTypes.STRING(3), // ISO code
    sembol: DataTypes.STRING(3),
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