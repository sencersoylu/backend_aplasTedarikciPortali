'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('genel_islem_grup', {

    genelIslemGrupID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    adi: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    aciklama: DataTypes.TEXT,
    createdAt: {
      type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    }

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here


  };

  return tanim;

};