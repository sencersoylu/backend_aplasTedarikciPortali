'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('dosya', {

    dosyaID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    adi: DataTypes.STRING,
    turu: DataTypes.STRING,
    icerik: DataTypes.BLOB('long')

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here


  };

  return tanim;

};