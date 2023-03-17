const Sequelize = require('sequelize');
const startupMode = require('../config/config.json').startupMode;

// const eesD1 = new Sequelize('EES_2023', 'sa', 'PLSkonigulsena206253', {
//     host: '10.46.5.88',
//     dialect: 'mssql',
//     timezone: '+03:00',
//     pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });

// const eesD2 = new Sequelize('EES_2023', 'sa', 'PLSkonigulsena206253', {
//     host: '10.45.1.111',
//     dialect: 'mssql',
//     timezone: '+03:00',
//     pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });


const appDB = new Sequelize(startupMode == 'production' ? 'tedarikcidb': 'tedarikcidb_test', 'root', 'Sencer77.', {
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    timezone: '+03:00',
    define: {
        freezeTableName: true,
        timestamps: true
    },
    dialectOptions: {
        decimalNumbers: true
    },
});



module.exports = {
   appDB
}