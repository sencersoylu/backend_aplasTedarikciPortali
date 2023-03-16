'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('genel_mahalle', {
        genelMahalleID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        genelSemtID: DataTypes.UUID,
        adi: DataTypes.STRING,
        postaKodu: DataTypes.INTEGER,
        createdAt: {
            type: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        updatedAt: {
            type: "DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP",
        },
    }, {});

    model.associate = function (models) {

        model.belongsTo(models.genel_semt, {
            foreignKey: 'genelSemtID',
            targetKey: 'genelSemtID'
        });

    };

    return model;

};