'use strict';

const request = require('request');
const HttpStatus = require('http-status-codes');

const config = require('../config');

class Ip2Location {
    query(ip, callback) {
        request.get(`${config.ip2locationUrl}?${config.ipaddressQueryString}=${ip}`, (err, res, body) => {
            if (!err && res.statusCode == HttpStatus.OK) {
                callback(JSON.parse(body));
            }
        });
    }
}

module.exports = Ip2Location;