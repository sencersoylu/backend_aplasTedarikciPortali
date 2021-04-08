'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_semt', {
        genelSemtID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        genelIlceID: DataTypes.INTEGER,
        adi: DataTypes.STRING,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

        model.belongsTo(models.genel_ilce, {
            foreignKey: 'genelIlceID',
            targetKey: 'genelIlceID'
        });

    };

    return model;

};
  
  