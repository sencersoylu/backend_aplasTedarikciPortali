'use strict';
module.exports = (sequelize, DataTypes) => {

    // kesinleşmiş satınalma siparişi
    const model = sequelize.define('siparis_yonetimi_kesin_siparis_hareket', {

        siparisYonetimiKesinSiparisHareketID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },

        siparisYonetimiKesinSiparisID: DataTypes.UUID,
        siparisYonetimiKesinSiparisOperasyonID: DataTypes.INTEGER,
        aciklama: DataTypes.STRING,

        createdUserID: DataTypes.UUID,
        updatedUserID: DataTypes.UUID,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },

    }, {});

    model.associate = function (models) {

        model.belongsTo(models.siparis_yonetimi_kesin_siparis, {
            foreignKey: 'siparisYonetimiKesinSiparisID',
            targetKey: 'siparisYonetimiKesinSiparisID'
        });

        model.belongsTo(models.siparis_yonetimi_kesin_siparis_operasyon, {
            foreignKey: 'siparisYonetimiKesinSiparisOperasyonID',
            targetKey: 'siparisYonetimiKesinSiparisOperasyonID'
        });

        
    };

    return model;

};