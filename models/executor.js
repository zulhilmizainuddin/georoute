const os = require('os');
const net = require('net');
const events = require('events');

const PublicIp = require('./public-ip');
const Tracert = require('./tracert');
const Traceroute = require('./traceroute');

class Executor extends events.EventEmitter {
    constructor(dbConnector) {
        super();

        this.dbConnector = dbConnector;

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

        tracer
            .on('pid', (pid) => {
                this.emit('pid', pid);
            })
            .on('destination', (destination) => {
                const destinationGeoInfo = this.dbConnector.query(destination);
                console.log(`executor: destination geo info ${JSON.stringify(destinationGeoInfo)}`);

                let result = null;
                if (destinationGeoInfo !== null) {
                    result = {
                        hop: '*',
                        ip : destination,
                        rtt1: '*',
                        country: destinationGeoInfo.country_long,
                        city: destinationGeoInfo.city,
                        latitude: destinationGeoInfo.latitude,
                        longitude: destinationGeoInfo.longitude
                    };
                }
                else {
                    result = {
                        hop: '*',
                        ip: destination,
                        rtt1: '*',
                        country: '*',
                        city: '*',
                        latitude: '*',
                        longitude: '*'
                    };
                }

                this.emit('destination', result);
            })
            .on('hop', (hop) => {
                if (hop.hop === 1) {
                    hop.ip = net.isIPv4(hop.ip) ? this.publicIpv4 : this.publicIpv6;
                }

                const geoInfo = this.dbConnector.query(hop.ip);
                console.log(`executor: geo info ${JSON.stringify(geoInfo)}`);

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
            })
            .on('done', (code) => {
                this.emit('done', code);
            });

        tracer.trace(domainName);
    }
}

module.exports = Executor;