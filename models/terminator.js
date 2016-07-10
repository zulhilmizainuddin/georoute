const process = require('process');

const Logger = require('../util/logger');

class Terminator {
    static terminate(pid) {
        Logger.info(`terminator killing process ${pid}`);

        try {
            process.kill(pid);
        }
        catch (err) {
            Logger.info(err);
        }
    }
}

module.exports = Terminator;
