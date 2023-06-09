'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('genel_menu', {

    genelMenuID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    adi: DataTypes.STRING,
    genelMenuParentID: DataTypes.UUID,
    siraNo: DataTypes.INTEGER,
    path: DataTypes.STRING,
    iconName: DataTypes.STRING,
    createdAt: {
      type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
    }

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here
    tanim.belongsTo(models.genel_menu, {
      foreignKey: 'genelMenuParentID',
      targetKey: 'genelMenuID'
    });

  };

  return tanim;

};