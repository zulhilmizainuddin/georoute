const express = require('express');
const validator = require('validator');
const uuid = require('node-uuid');
const HttpStatus = require('http-status-codes');

const router = express.Router();

const Executor = require('../models/executor');
const Ip2Location = require('../models/ip2location');
const Terminator = require('../models/terminator');
const cache = require('../models/cache');

router.post('/', (req, res, next) => {
    console.log(`trace domain name ${req.body.domainName} received`);

    if (!validator.isFQDN(req.body.domainName) && !validator.isIP(req.body.domainName)) {
        console.log(`trace not a valid domain name or ip received, returning http ${HttpStatus.BAD_REQUEST}`);

        res.sendStatus(HttpStatus.BAD_REQUEST);
        return;
    }

    if (req.session.guid) {
        const previousPid = cache.get(req.session.guid);
        if (previousPid) {
            Terminator.terminate(previousPid);
            cache.delete(req.session.guid);
        }
    }

    const guid = uuid.v4();
    req.session.guid = guid;
    res.status(HttpStatus.OK).send({ guid: guid });

    const socketNamespace = req.app.io.of('/' + guid);
    socketNamespace.on('connection', (socket) => {
        console.log(`a user from ${socket.conn.remoteAddress} connected`);

        let pidHolder = null;
        const executor = new Executor(new Ip2Location());
        executor
            .on('pid', (pid) => {
                pidHolder = pid;
                cache.set(guid, pid);
            })
            .on('destination', (destination) => {
                socketNamespace.emit('destination', destination);
            })
            .on('data', (data) => {
                socketNamespace.emit('data', data);
            })
            .on('done', (code) => {
                if (code) {
                    socketNamespace.emit('terminated');
                }
                else {
                    socketNamespace.emit('done');
                }
            });

        socket.on('disconnect', () => {
            console.log(`a user from ${socket.conn.remoteAddress} disconnected`);

            if (pidHolder) {
                Terminator.terminate(pidHolder);
                cache.delete(guid);
            }
        });

        executor.start(req.body.domainName);
    });

});

module.exports = router;