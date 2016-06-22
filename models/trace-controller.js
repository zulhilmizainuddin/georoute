const os = require('os');
const net = require('net');
const events = require('events');

const Ip2Location = require('./ip2location');
const PublicIp = require('./public-ip');
const Tracert = require('./tracert');
const Traceroute = require('./traceroute');

class TraceController extends events.EventEmitter {
    constructor() {
        super();

        this.publicIpv4 = null;
        this.publicIpv6 = null;
    }

    start(domainName) {
        const publicIp = new PublicIp();
        publicIp.queryOwnPublicIp();
        publicIp.on('ipv4', (ip) => {
                    this.publicIpv4 = ip;
                    if (this.publicIpv4 !== null && this.publicIpv6 !== null) {
                        this.trace(domainName);
                    }
                })
                .on('ipv6', (ip) => {
                    this.publicIpv6 = ip;
                    if (this.publicIpv4 !== null && this.publicIpv6 !== null) {
                        this.trace(domainName);
                    }
                });
    }

    trace(domainName) {
        const tracer = (os.platform() === 'win32') ? new Tracert() : new Traceroute();
        tracer.trace(domainName);

        const ip2Location = new Ip2Location();
        tracer.on('hop', (hop) => {
            if (hop.hop === 1) {
                hop.ip = net.isIPv4(hop.ip) ? this.publicIpv4 : this.publicIpv6;
            }

            const geoInfo = ip2Location.query(hop.ip);
            console.log(`trace-controller: geo info ${JSON.stringify(geoInfo)}`);

            let result = null;
            if (geoInfo !== null) {
                result = {
                    hop: hop.hop,
                    ip: hop.ip,
                    rtt1: hop.rtt1,
                    country: geoInfo.country_long,
                    city: geoInfo.city,
                    latitude: geoInfo.latitude,
                    longitude: geoInfo.longitude
                };
            }
            else {
                result = {
                    hop: hop.hop,
                    ip: hop.ip,
                    rtt1: hop.rtt1,
                    country: '*',
                    city: '*',
                    latitude: '*',
                    longitude: '*'
                };
            }

            this.emit('data', result);
        });

        tracer.on('done', (code) => {
            this.emit('done', code);
        });
    }
}

module.exports = TraceController;