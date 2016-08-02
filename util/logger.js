'use strict';

const winston = require('winston');

const config = require('../config');

class Logger {
    constructor() {
        winston.remove(winston.transports.Console);
        winston.add(winston.transports.Console, {timestamp: true});
        winston.level = config.logLevel;
    }

    info(text) {
        winston.info(text);
    }

    error(text) {
        winston.error(text);
    }
}

const logger = new Logger();
Object.freeze(logger);

module.exports = logger;