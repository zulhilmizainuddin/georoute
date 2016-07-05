const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Georoute',
    year: '2016'
  });
});

module.exports = router;
