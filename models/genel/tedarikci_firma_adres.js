'use strict';

module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('tedarikci_firma_adres', {

    tedarikciFirmaAdresID: {
      type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,primaryKey: true
    },
    tedarikciFirmaID: DataTypes.UUID,
    genelUlkeID: DataTypes.UUID,
    genelIlID: DataTypes.UUID,
    adres: DataTypes.TEXT,
    kisaKodu: DataTypes.STRING,
    
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