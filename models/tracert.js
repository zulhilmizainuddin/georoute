const spawn = require('child_process').spawn;
const events = require('events');
const readline = require('readline');

class Tracert extends events.EventEmitter {
    trace(domainName) {
        const tracert = spawn('tracert', ['-d', domainName]);
        tracert.on('close', (code) => {
            this.emit('done', code);
            console.log(`tracert process exited with code ${code}`);
        });

        this.emit('pid', tracert.pid);

        let isDestinationCaptured = false;
        if (tracert.pid !== undefined) {
            readline.createInterface({
                    input: tracert.stdout,
                    terminal: false
                })
                .on('line', (line) => {
                    if (!isDestinationCaptured) {
                        const destination = Tracert.parseDestination(line);
                        if (destination !== null) {
                            this.emit('destination', destination);
                            console.log(`tracert destination: ${destination}`);

                            isDestinationCaptured = true;
                        }
                    }

                    const hop = Tracert.parseHop(line);
                    if (hop !== null) {
                        this.emit('hop', hop);
                        console.log(`tracert hop: ${JSON.stringify(hop)}`);
                    }
                });

            readline.createInterface({
                    input: tracert.stderr,
                    terminal: false
                })
                .on('line', (line) => {
                    console.log(`tracert error: ${line}`);
                });
        }
    }

    static parseDestination(data) {
        const regex = /^Tracing\sroute\sto\s([a-zA-Z0-9:.]+)\s(?:\[([a-zA-Z0-9:.]+)\])?/;
        const parsedData = new RegExp(regex, '').exec(data);

        let result = null;
        if (parsedData !== null) {
            if (parsedData[2] !== undefined) {
                result = parsedData[2];
            }
            else {
                result = parsedData[1];
            }
        }

        return result;
    }

    static parseHop(hopData) {
        const regex = /^\s*(\d*)\s*(\d+\sms|\*)\s*(\d+\sms|\*)\s*(\d+\sms|\*)\s*([a-zA-Z0-9:.\s]+)/;
        const parsedData = new RegExp(regex, '').exec(hopData);

        let result = null;
        if (parsedData !== null) {
            result = {
                hop: parseInt(parsedData[1], 10),
                rtt1: parsedData[2],
                rtt2: parsedData[3],
                rtt3: parsedData[4],
                ip: parsedData[5].trim()
            };
        }

        return result;
    }
}

module.exports = Tracert;