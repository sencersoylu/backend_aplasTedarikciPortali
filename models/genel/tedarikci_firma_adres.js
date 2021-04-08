'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('tedarikci_firma_adres', {

    tedarikciFirmaAdresID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tedarikciFirmaID: DataTypes.INTEGER,
    genelUlkeID: DataTypes.INTEGER,
    genelIlID: DataTypes.INTEGER,
    adres: DataTypes.TEXT,
    kisaKodu: DataTypes.STRING,
    
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
    
    tanim.belongsTo(models.tedarikci_firma, {
      foreignKey: 'tedarikciFirmaID',
      targetKey: 'tedarikciFirmaID'
    });

    tanim.belongsTo(models.genel_ulke, {
      foreignKey: 'genelUlkeID',
      targetKey: 'genelUlkeID'
    });

    tanim.belongsTo(models.genel_il, {
      foreignKey: 'genelIlID',
      targetKey: 'genelIlID'
    });


  };

  return tanim;

};