const process = require('process');

class Terminator {
    static terminate(pid) {
        console.log(`terminator killing process ${pid}`);

        try {
            process.kill(pid);
        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports = Terminator;
