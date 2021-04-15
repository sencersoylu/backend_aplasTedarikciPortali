'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('dosya', {

    dosyaID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
      allowNull: false
    },
    adi: DataTypes.STRING,
    turu: DataTypes.STRING,
    icerik: DataTypes.BLOB('long')

  }, {});

  return tanim;

};