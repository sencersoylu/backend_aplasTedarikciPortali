'use strict';
module.exports = (sequelize, DataTypes) => {
	
  const tanim = sequelize.define('kullanici_genel_menu_yetki', {
	  
    kullaniciGenelMenuYetkiID: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4,
	  primaryKey: true
    },
	genelMenuID: {
		type: DataTypes.UUID,
		allowNull: false
	},
    kullaniciID: {
		type: DataTypes.UUID,
		allowNull: false
	},
	
    ekleyebilir: {
		type: DataTypes.BOOLEAN,
		allowNull: false, 
		defaultValue: false
	},
	silebilir: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	duzenleyebilir: {
		type: DataTypes.BOOLEAN,
		allowNull: false, 
		defaultValue: false
	},
	gorebilir: {
		type: DataTypes.BOOLEAN,
		allowNull: false, 
		defaultValue: false
	},
	createdAt: {
		type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
	},
	updatedAt: {
		type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
	},
	
  }, {});
  
  tanim.associate = function (models) {
    // associations can be defined here
	tanim.belongsTo(models.genel_menu, {
      foreignKey: 'genelMenuID',
      targetKey: 'genelMenuID'
    });

	tanim.belongsTo(models.kullanici, {
		foreignKey: 'kullaniciID',
		targetKey: 'kullaniciID'
	  });
	
  };
  
  return tanim;
  
};