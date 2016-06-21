const spawn = require('child_process').spawn;
const events = require('events');
const readline = require('readline');

class Tracert extends events.EventEmitter {
    trace(domainName) {
        const tracert = spawn('tracert', ['-d', domainName]);

        readline.createInterface({
            input: tracert.stdout,
            terminal: false
        })
        .on('line', (line) => {
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

        tracert.on('close', (code) => {
            this.emit('done', code);
            console.log(`tracert process exited with code ${code}`);
        });
    }

    static parseHop(hopData) {
        const regex = /\s*(\d*)\s*(\d+\sms|\*)\s*(\d+\sms|\*)\s*(\d+\sms|\*)\s*([a-zA-Z0-9:.\s]+)/;
        const parsedData = new RegExp(regex, 'g').exec(hopData);

        let result = null;
        if (parsedData !== null) {
            result = {
                hop: parsedData[1],
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