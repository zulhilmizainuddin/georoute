const express = require('express');
const router = express.Router();

const Tracert = require('../models/tracert');

router.post('/', (req, res, next) => {
    try {
        const tracer = new Tracert();

        tracer.trace(req.body.domainName);
        tracer.on('hop', (hop) => {
            /*console.log(JSON.stringify(hop));*/
        })
    }
    catch (err) {
        console.log(err);
    }

    res.sendStatus(200);
});

module.exports = router;