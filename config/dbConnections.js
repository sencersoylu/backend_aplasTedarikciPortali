const Sequelize = require('sequelize');
const startupMode = require('../config/config.json').startupMode;

const eesD1 = new Sequelize('EES_2022', 'sa', 'PLSkonigulsena206253', {
    host: '10.46.5.88',
    dialect: 'mssql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const eesD2 = new Sequelize('EES_2022', 'sa', 'PLSkonigulsena206253', {
    host: '10.45.1.111',
    dialect: 'mssql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const uvtD1 = new Sequelize('uretim', 'root', '5421', {
    host: '10.46.5.112',
    dialect: 'mysql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});

const uvtD2 = new Sequelize('uretim', 'root', '5421', {
    host: '10.45.1.111',
    dialect: 'mysql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});

const uvtFinalKontrol = new Sequelize('final_kontrol', 'root', '5421', {
    host: '10.45.1.111',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
});


const kaplamaDB = new Sequelize('Kaplama_Rapor', 'sqlkullanicisi', '123456', {
    host: '10.46.5.65',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            instanceName: 'sqlexpress'
        }
    },
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const uvtKaplamaDB = new Sequelize('uretim', 'root', '5421', {
    host: '10.46.5.112',
    dialect: 'mysql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const logoPersonelDB = new Sequelize('BORDROPLUS', 'sa', 'PLSkonigulsena206253', {
    host: '10.45.1.53',
    dialect: 'mssql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// personellerin fabrikalardaki turnikelerden giriş/çıkış hareketlerini tutmakta
const zkPersonelDB = new Sequelize('ZK', 'sa', 'PLSkonigulsena206253', {
    host: '10.45.1.59',
    dialect: 'mssql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


// VARIABLE CONNECTION CONFIGS
const portalDB = new Sequelize(startupMode == 'production' ? 'bimportaldb': 'bimportaltestguncelleme', 'root', '5421', {
    host: "10.45.1.111",
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

const jitD2 = new Sequelize(startupMode == 'production' ? 'fjit': 'fjittest', 'root', '5421', {
    host: '10.45.1.111',
    dialect: 'mysql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});


const eesDepoD1 = new Sequelize('DEES_DEPO', 'sa', 'PLSkonigulsena206253', {
    host: '10.46.5.88',
    dialect: 'mssql',
    timezone: '+03:00',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const appDB = new Sequelize(startupMode == 'production' ? 'tedarikcidb': 'tedarikcidb_test', 'root', '5421', {
    host: "10.45.1.111",
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
    eesD1,
    eesD2,
    uvtD1,
    uvtD2,
    jitD2,
    kaplamaDB,
    uvtKaplamaDB,
    logoPersonelDB,
    zkPersonelDB,
    appDB,
    uvtFinalKontrol,
    eesDepoD1,
    portalDB
}