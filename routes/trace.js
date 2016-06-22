const express = require('express');
const validator = require('validator');

const router = express.Router();

router.post('/', (req, res, next) => {
    if (!validator.isURL(req.body.domainName) && !validator.isIP(req.body.domainName)) {
        res.sendStatus(400);
        return;
    }

    res.sendStatus(200);
});

module.exports = router;