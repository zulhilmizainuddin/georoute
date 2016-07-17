const dgram = require('dgram');
const dns = require('dns-socket');
const events = require('events');

const Logger = require('../util/logger');

class PublicIp extends events.EventEmitter {
    queryOwnPublicIp() {
        this.getIp('ipv4');
        this.getIp('ipv6');
    }

    getIp(version) {
        const type = {
            ipv4: {
                server: '208.67.222.222',
                question: {
                    name: 'myip.opendns.com',
                    type: 'A'
                }
            },
            ipv6: {
                server: '2620:0:ccc::2',
                question: {
                    name: 'myip.opendns.com',
                    type: 'AAAA'
                }
            }
        };

        const data = type[version];
        const socket = dns({
            socket: dgram.createSocket(version === 'ipv6' ? 'udp6' : 'udp4'),
            retries: 1
        });

        socket.query.bind(socket);
        socket.query({
            questions: [data.question]
        }, 53, data.server, (err, res) => {
            socket.destroy();

            let ip = undefined;
            if (res !== undefined) {
                ip = res.answers[0] && res.answers[0].data;
            }

            Logger.info(`public ip ${version}: ${ip}`);

            this.emit(version, ip);
        });
    }
}

module.exports = PublicIp;
