const spawn = require('child_process').spawn;
const events = require('events');
const readline = require('readline');

const Logger = require('../util/logger');

class Process extends events.EventEmitter {
    constructor(command, args) {
        super();

        this.command = command;
        this.args = args;
    }
    trace(domainName) {
        this.args.push(domainName);

        const process = spawn(this.command, this.args);
        process.on('close', (code) => {
            this.emit('done', code);
            Logger.info(`process exited with code ${code}`);
        });

        this.emit('pid', process.pid);

        let isDestinationCaptured = false;
        if (process.pid !== undefined) {
            readline.createInterface({
                    input: process.stdout,
                    terminal: false
                })
                .on('line', (line) => {
                    if (!isDestinationCaptured) {
                        const destination = this.parseDestination(line);
                        if (destination !== null) {
                            this.emit('destination', destination);
                            Logger.info(`process destination: ${destination}`);

                            isDestinationCaptured = true;
                        }
                    }

                    const hop = this.parseHop(line);
                    if (hop !== null) {
                        this.emit('hop', hop);
                        Logger.info(`process hop: ${JSON.stringify(hop)}`);
                    }
                });

            readline.createInterface({
                    input: process.stderr,
                    terminal: false
                })
                .on('line', (line) => {
                    Logger.info(`process error: ${line}`);
                });
        }
    }

    parseDestination(data) {}
    parseHop(hopData) {}
}

module.exports = Process;