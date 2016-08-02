'use strict';

const ip2loc = require('ip2location-nodejs');
const path = require('path');
const net = require('net');

const config = require('../config');

class Ip2Location {
    constructor() {
        this.connectedDb = '';
    }

    query(ip) {
        let database = null;

        if (net.isIPv4(ip)) {
            database = config.ipv4db;
        }
        else if(net.isIPv6(ip)) {
            database = config.ipv6db;
        }

        let result = null;
        if (database !== null) {
            if (this.connectedDb !== database) {
                const databasePath = path.join(__dirname, `../databases/${database}`);

                ip2loc.IP2Location_init(databasePath);
                this.connectedDb = database;
            }

            result = ip2loc.IP2Location_get_all(ip);
        }

        return result;
    }
}

module.exports = Ip2Location;