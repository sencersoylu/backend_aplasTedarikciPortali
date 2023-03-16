'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_il', {
        genelIlID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        genelUlkeID: DataTypes.UUID,
        adi: DataTypes.STRING,
        plakaNo: DataTypes.STRING,
        telefonKodu: DataTypes.STRING,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

        model.belongsTo(models.genel_ulke, {
            foreignKey: 'genelUlkeID',
            targetKey: 'genelUlkeID'
        });

    };

    return model;

};