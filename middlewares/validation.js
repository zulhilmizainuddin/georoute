'use strict';

const express = require('express');
const router = express.Router();

const HttpStatus = require('http-status-codes');
const validator = require('validator');
const Logger = require('../util/logger');

router.post('/', (req, res, next) => {
    if (!validator.isFQDN(req.body.domainName + '') && !validator.isIP(req.body.domainName + '')) {
        Logger.info(`trace not a valid domain name or ip received, returning http ${HttpStatus.BAD_REQUEST}`);

        res.sendStatus(HttpStatus.BAD_REQUEST);
        return;
    }

    next();
});

module.exports = router;
