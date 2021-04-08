const configs = require('../config/config.json');

const sendMail = require('./sendMail');

const starter = setTimeout(() => {

    if (configs.startupMode != "test") {

        sendMail();
    }

}, 6000); // run crons after 6 seconds


module.exports = starter;