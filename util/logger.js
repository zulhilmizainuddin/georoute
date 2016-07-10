const winston = require('winston');

const config = require('../config');

class Logger {
    static info(text) {
        winston.level = config.logLevel;
        winston.info(text);
    }

    static error(text) {
        winston.level = config.logLevel;
        winston.error(text);
    }
}

module.exports = Logger;