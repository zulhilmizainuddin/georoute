'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');
const net = require('net');

const config = require('../config');

class Ip2Location {

    query(ip) {
        return new Promise((resolve, reject) => {

            if (!net.isIP(ip)) {
                resolve({
                    ip: ip,
                    city: '*',
                    country: '*',
                    latitude: '*',
                    longitude: '*'
                });

                return;
            }

            request.get(`${config.ip2locationUrl}?${config.ipaddressQueryString}=${ip}`, (err, res, body) => {
                if (!err && res.statusCode === HttpStatus.OK) {
                    resolve(JSON.parse(body));
                }
                else {
                    resolve({
                        ip: ip,
                        city: '*',
                        country: '*',
                        latitude: '*',
                        longitude: '*'
                    });
                }
            });
        });
    }
}

module.exports = Ip2Location;