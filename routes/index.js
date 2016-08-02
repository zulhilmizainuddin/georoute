'use strict';

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Georoute',
    heading: 'georoute',
    description: 'Traceroute on a map',
    keywords: 'traceroute, tracert, geoip, geolocation, map',
    author: 'Zulhilmi Mohamed Zainuddin',
    homepage: 'http://georoute.tech',
    githubRepository: 'https://github.com/zulhilmizainuddin/georoute',
    githubLinkText: 'View on GitHub',
    domainInputPlaceholder: 'Domain name or ip address',
    traceButtonText: 'Trace',
    hopsTableHeader: 'Hops',
    year: '2016',
    disclaimer: 'This site or product includes IP2Location LITE data available from <a href="http://lite.ip2location.com">http://lite.ip2location.com</a>.'
  });
});

module.exports = router;
