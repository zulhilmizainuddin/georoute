'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');

const config = require('../config');

class Ip2Location {

    query(ip) {
        return new Promise((resolve, reject) => {

            request.get(`${config.ip2locationUrl}?${config.ipaddressQueryString}=${ip}`, (err, res, body) => {
                if (!err && res.statusCode === HttpStatus.OK) {
                    resolve(JSON.parse(body));
                }
                else {
                    reject(err);
                }
            });
        });
    }
}

module.exports = Ip2Location;