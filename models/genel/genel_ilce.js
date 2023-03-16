'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_ilce', {
        genelIlceID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        genelIlID: DataTypes.UUID,
        adi: DataTypes.STRING,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

        model.belongsTo(models.genel_il, {
            foreignKey: 'genelIlID',
            targetKey: 'genelIlID'
        });

    };

    return model;

};