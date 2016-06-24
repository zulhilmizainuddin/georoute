const spawn = require('child_process').spawn;
const events = require('events');
const readline = require('readline');

class Traceroute extends events.EventEmitter {
    trace(domainName) {
        const traceroute = spawn('traceroute', ['-q', 1,'-n', domainName]);
        traceroute.on('close', (code) => {
            this.emit('done', code);
            console.log(`traceroute process exited with code ${code}`);
        });

        this.emit('pid', traceroute.pid);

        if (traceroute.pid !== undefined) {
            readline.createInterface({
                    input: traceroute.stdout,
                    terminal: false
                })
                .on('line', (line) => {
                    const hop = Traceroute.parseHop(line);

                    if (hop !== null) {
                        this.emit('hop', hop);
                        console.log(`traceroute hop: ${JSON.stringify(hop)}`);
                    }
                });

            readline.createInterface({
                    input: traceroute.stderr,
                    terminal: false
                })
                .on('line', (line) => {
                    console.log(`traceroute error: ${line}`);
                });
        }
    }

    static parseHop(hopData) {
        const regex = /\s*(\d+)\s+(?:([a-zA-Z0-9:.]+)\s+([0-9.]+\s+ms)|(\*))/;
        const parsedData = new RegExp(regex, '').exec(hopData);

        let result = null;
        if (parsedData !== null) {
            if (parsedData[4] === undefined) {
                result = {
                    hop: parseInt(parsedData[1]),
                    ip: parsedData[2],
                    rtt1: parsedData[3]
                };
            }
            else {
                result = {
                    hop: parseInt(parsedData[1]),
                    ip: parsedData[4],
                    rtt1: parsedData[4]
                };
            }
        }

        return result;
    }
}

module.exports = Traceroute;