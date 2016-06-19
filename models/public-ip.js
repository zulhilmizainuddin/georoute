const publicIp = require('public-ip');

class PublicIp {
    getOwnPublicIp(callback) {
        publicIp.v4().then(ip => {
            console.log(`public ipv4: ${ip}`);
            callback(ip);
        });

        publicIp.v6().then(ip => {
            console.log(`public ipv4: ${ip}`);
            callback(ip);
        });
    }
}

module.exports = PublicIp;
