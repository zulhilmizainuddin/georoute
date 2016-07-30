const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'georoute',
    description: 'traceroute on a map',
    keywords: 'traceroute, tracert, geoip, geolocation, map',
    author: 'Zulhilmi Mohamed Zainuddin',
    githubRepository: 'https://github.com/zulhilmizainuddin/georoute',
    githubLinkText: 'View on GitHub',
    domainInputPlaceholder: 'domain name or ip address',
    traceButtonText: 'trace',
    hopsTableHeader: 'hops',
    year: '2016',
    disclaimer: 'This site or product includes IP2Location LITE data available from <a href="http://lite.ip2location.com">http://lite.ip2location.com</a>.'
  });
});

module.exports = router;
