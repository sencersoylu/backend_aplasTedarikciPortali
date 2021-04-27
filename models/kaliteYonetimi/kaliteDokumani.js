'use strict';
module.exports = (sequelize, DataTypes) => {

    const model = sequelize.define('kalite_yonetimi_kalite_dokumani', {
        kaliteYonetimiKaliteDokumaniID: {
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        kaliteYonetimiKaliteDokumaniTurID: DataTypes.INTEGER,
        tedarikciFirmaID: DataTypes.UUID,

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

        model.belongsTo(models.kalite_yonetimi_kalite_dokumani_tur, {
            foreignKey: 'kaliteYonetimiKaliteDokumaniTurID',
            targetKey: 'kaliteYonetimiKaliteDokumaniTurID'
        });

        model.belongsTo(models.tedarikci_firma, {
            foreignKey: 'tedarikciFirmaID',
            targetKey: 'tedarikciFirmaID'
        });



    };

    return model;

};