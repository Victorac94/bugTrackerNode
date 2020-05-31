var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user');

/* GET home page. */
// https://localhost
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Login page */
// https://localhost/login
router.get('/login', (req, res) => {
  res.send('Login page');
});



module.exports = router;
