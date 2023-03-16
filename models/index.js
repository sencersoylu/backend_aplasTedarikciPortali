'use strict';

// REQUIREMENTS
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = require('../config/config.json');
const dbConnections = require('../config/dbConnections.js');

// VARIABLES
const env = config.startupMode;
const db = {};
let sequelize = dbConnections.appDB;

for (let i = 1; i <= 10; i++) {
  console.log(`**********************************      ${env}      ******************************************`);
}

let folderNames = fs.readdirSync(__dirname, { withFileTypes: false })
  .filter(file => {
    return file.indexOf('.') === -1;
  });

folderNames.forEach(folderName => {
  const modulePath = path.join(__dirname, folderName);
  const files = fs.readdirSync(modulePath);

  if (files.length > 0) {

    files
      .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
      })
      .forEach(file => {
        const model = sequelize['import'](path.join(modulePath, file));
        db[model.name] = model;
      });

  }



});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.sequelize.sync({
    // DİKKAT!!! => FORCE TRUE OLUR İSE TABLODAKİ BÜTÜN DATA SİLİNİR!!!
    force: false
  }).then(() => {
    for (let i = 1; i <= 10; i++) {
      console.log("**********************************      db.sequelize.sync => Successfully completed      ******************************************");
    }
  })
  .catch(err => {
    console.error(`**********************************      db.sequelize.sync => ${err}      ******************************************`);
  });

module.exports = db;