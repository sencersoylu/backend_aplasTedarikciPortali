'use strict';
module.exports = (sequelize, DataTypes) => {
	
  const tanim = sequelize.define('operasyon_kullanici_grup_yetki', {
	  
    operasyonKullaniciGrupYetkiID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
	},
	
	operasyonID: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
    kullaniciGrupID: {
		type: DataTypes.INTEGER,
		allowNull: false
	},

	durum: {
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

	tanim.belongsTo(models.operasyon, {
		foreignKey: 'operasyonID',
		targetKey: 'operasyonID'
	  });

	tanim.belongsTo(models.kullanici_grup, {
      foreignKey: 'kullaniciGrupID',
      targetKey: 'kullaniciGrupID'
    });
	
  };
  
  return tanim;
  
};