const express = require('express');
const validator = require('validator');
const process = require('process');
const HttpStatus = require('http-status-codes');

const router = express.Router();

const TraceController = require('../models/trace-controller');

router.post('/', (req, res, next) => {
    console.log(`trace domain name ${req.body.domainName} received`);

    if (!validator.isURL(req.body.domainName) && !validator.isIP(req.body.domainName)) {
        console.log(`trace not a valid domain name or ip received, returning http ${HttpStatus.BAD_REQUEST}`);

        res.sendStatus(HttpStatus.BAD_REQUEST);
        return;
    }

    if (req.session.pid !== undefined) {
        console.log(`trace killing process id ${req.session.pid}`);

        try {
            process.kill(req.session.pid);
        }
        catch (err) {
            console.log(err);
        }
    }

    const tracer = new TraceController();
    tracer
        .on('pid', (pid) => {
            req.session.pid = pid;
            if (pid !== undefined) {
                console.log(`trace process with id ${pid} created, returning http ${HttpStatus.OK}`);

                res.sendStatus(HttpStatus.OK);
            }
            else {
                console.log(`trace process not created, returning http ${HttpStatus.INTERNAL_SERVER_ERROR}`);

                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        })
        .on('data', (data) => {
            req.app.io.emit('data', data);
        })
        .on('done', (code) => {
            req.app.io.emit('done');
        });

    tracer.start(req.body.domainName);
});

module.exports = router;