const ip2loc = require('ip2location-nodejs');
const path = require('path');

class Ip2Location {
    query(ip) {
        let database = (ip.match(/\d+\.\d+\.\d+\.\d+/) !== null) ? 'IP2LOCATION-LITE-DB5.BIN' : 'IP2LOCATION-LITE-DB5.IPV6.BIN';
        database = path.join(__dirname, `../databases/${database}`);

        ip2loc.IP2Location_init(database);

        const result = ip2loc.IP2Location_get_all(ip);
        return result;
    }
}

module.exports = Ip2Location;