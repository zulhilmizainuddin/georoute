'use strict';

const os = require('os');
const net = require('net');
const events = require('events');
const PublicIp = require('nodejs-publicip');
const Traceroute = require('nodejs-traceroute');

const config = require('../config');
const Queue = require('./queue');
const Logger = require('../util/logger');

class Executor extends events.EventEmitter {
    constructor(dbConnector) {
        super();

        this.dbConnector = dbConnector;

        this.hopQueue = new Queue();

        this.isCloseReceived = false;
        this.closeCode = null;
    }

    start(domainName) {
        new PublicIp()
            .queryPublicIPAddresses()
            .then((result) => {
                Logger.info(`executor: public ipv4 ${result.ipv4}`);
                Logger.info(`executor: public ipv6 ${result.ipv6}`);

                this.trace(domainName, result.ipv4, result.ipv6);
            })
            .catch((err) => {
                Logger.info(`executor: ${err}`);
            });
    }

    trace(domainName, publicIpv4, publicIpv6) {
        const tracer = new Traceroute(config.tracerouteDelay);

        let destinationIp;
        tracer
            .on('pid', (pid) => {
                this.emit('pid', pid);
            })
            .on('destination', (destination) => {
                let result = null;
                destinationIp = destination;

                this.dbConnector
                    .query(destination)
                    .then((geoInfo) => {
                        result = {
                                hop: '*',
                                ip : destination,
                                rtt1: '*',
                                city: geoInfo.city !== '-' ? geoInfo.city : '*',
                                country: geoInfo.country !== '-' ? geoInfo.country : '*',
                                latitude: geoInfo.latitude !== 0 ? geoInfo.latitude : '*',
                                longitude: geoInfo.longitude !== 0 ? geoInfo.longitude: '*'
                            };

                        Logger.info(`executor: destination geo info ${JSON.stringify(result)}`);
                        this.emit('destination', result);
                    });
            })
            .on('hop', (hop) => {
                this.hopQueue.enqueue({
                    hop: hop.hop,
                    geoInfo: null
                });

                if (hop.hop === 1) {
                    hop.ip = net.isIPv4(destinationIp) ? publicIpv4 : publicIpv6;
                }
                
                let result = null;
                this.dbConnector
                    .query(hop.ip)
                    .then((geoInfo) => {
                        result = {
                            hop: hop.hop,
                            ip: hop.ip,
                            rtt1: hop.rtt1,
                            city: geoInfo.city !== '-' ? geoInfo.city : '*',
                            country: geoInfo.country !== '-' ? geoInfo.country : '*',
                            latitude: geoInfo.latitude !== 0 ? geoInfo.latitude : '*',
                            longitude: geoInfo.longitude !== 0 ? geoInfo.longitude : '*'
                        };

                        Logger.info(`executor: geo info ${JSON.stringify(result)}`);

                        this.hopQueue.setValue(hop.hop, result);

                        this.emitQueuedGeoInfo();
                        this.emitClose();
                    });
            })
            .on('close', (code) => {
                this.isCloseReceived = true;
                this.closeCode = code;

                Logger.info(`executor: close with code ${code} received`);

                this.emitClose();
            });

        tracer.trace(domainName);
    }

    emitQueuedGeoInfo() {
        for (;;) {
            if (this.hopQueue.peek() && this.hopQueue.peek().geoInfo !== null) {
                const data = this.hopQueue.dequeue();
                this.emit('data', data.geoInfo);
            }
            else {
                break;
            }
        }
    }

    emitClose() {
        if (this.isCloseReceived && this.hopQueue.size() === 0) {
            this.emit('close', this.closeCode);

            Logger.info(`executor: close with code ${this.closeCode} emitted to client`);
        }
    }
}

module.exports = Executor;