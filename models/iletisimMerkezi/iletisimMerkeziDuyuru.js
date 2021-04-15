'use strict';
module.exports = (sequelize, DataTypes) => {

  const tanim = sequelize.define('iletisim_merkezi_duyuru', {

    iletisimMerkeziDuyuruID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    baslik: DataTypes.STRING,
    icerikOzet: DataTypes.TEXT,
    icerik: DataTypes.TEXT,
    yayinBaslangicTarihi: DataTypes.DATE,
    yayinBitisTarihi: DataTypes.DATE,
    duyuruyuUsteAl: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {});

  tanim.associate = function (models) {
    // associations can be defined here

    tanim.belongsToMany(models.dosya, {
       as: 'duyuruFotolari', 
       through: 'duyuru_fotolari',
       foreignKey: 'iletisimMerkeziDuyuruID', 
       otherKey: 'dosyaID',
        onDelete: 'cascade' 
      });

    tanim.belongsToMany(models.dosya, { 
      as: 'duyuruEkleri', 
      through: 'duyuru_ekleri', 
      foreignKey: 'iletisimMerkeziDuyuruID', 
      otherKey: 'dosyaID', 
      onDelete: 'cascade' 
    });

  };

  return tanim;

};