'use strict';

const os = require('os');
const net = require('net');
const events = require('events');
const PublicIp = require('nodejs-publicip');
const Traceroute = require('nodejs-traceroute');

const config = require('../config');
const Logger = require('../util/logger');

class Executor extends events.EventEmitter {
    constructor(dbConnector) {
        super();

        this.dbConnector = dbConnector;

        this.publicIpv4 = null;
        this.publicIpv6 = null;
    }

    start(domainName) {
        const publicIp = new PublicIp();
        publicIp.queryPublicIPAddresses((err, ipv4, ipv6) => {
            if (err) {
                Logger.error(`executer: ${err}`);
                return;
            }
        
            Logger.info(`executor: public ipv4 ${ipv4}`);
            Logger.info(`executor: public ipv6 ${ipv6}`);

            this.publicIpv4 = ipv4;
            this.publicIpv6 = ipv6;

            this.trace(domainName);
        });
    }

    trace(domainName) {
        const tracer = new Traceroute(config.tracerouteDelay);

        let destinationIp;
        tracer
            .on('pid', (pid) => {
                this.emit('pid', pid);
            })
            .on('destination', (destination) => {
                destinationIp = destination;
                this.dbConnector.query(destination, (destinationGeoInfo) => {
                    let result = {
                            hop: '*',
                            ip : destination,
                            rtt1: '*',
                            country: destinationGeoInfo.country !== '-' ? destinationGeoInfo.country : '*',
                            city: destinationGeoInfo.city !== '-' ? destinationGeoInfo.city : '*',
                            latitude: destinationGeoInfo.latitude !== '-' ? destinationGeoInfo.latitude : '*',
                            longitude: destinationGeoInfo.longitude !== '-' ? destinationGeoInfo.longitude: '*'
                        };

                    Logger.info(`executor: destination geo info ${JSON.stringify(result)}`);
                    this.emit('destination', result);
                    });
            })
            .on('hop', (hop) => {
                if (hop.hop === 1) {
                    hop.ip = net.isIPv4(destinationIp) ? this.publicIpv4 : this.publicIpv6;
                }
                
                let result = null;
                if (net.isIP(hop.ip)) {
                    this.dbConnector.query(hop.ip, (geoInfo) => {
                        result = {
                            hop: hop.hop,
                            ip: hop.ip,
                            rtt1: hop.rtt1,
                            country: geoInfo.country !== '-' ? geoInfo.country : '*',
                            city: geoInfo.city !== '-' ? geoInfo.city : '*',
                            latitude: geoInfo.latitude !== 0 ? geoInfo.latitude : '*',
                            longitude: geoInfo.longitude !== 0 ? geoInfo.longitude : '*'
                        };

                        Logger.info(`executor: geo info ${JSON.stringify(result)}`);
                        this.emit('data', result);
                    });
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

                    Logger.info(`executor: geo info ${JSON.stringify(result)}`);
                    this.emit('data', result);
                }
            })
            .on('close', (code) => {
                this.emit('close', code);
            });

        tracer.trace(domainName);
    }
}

module.exports = Executor;