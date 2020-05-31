var express = require('express');
var router = express.Router();
const moment = require('moment');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../models/user.js');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');

/* GET users listing. */
// http://localhost:3000/users
router.get('/', async (req, res) => {
  try {
    const user = new User();

    const users = await user.getAll().exec();
    res.status(200).json(users);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

/* Handle user registration */
// http://localhost:3000/users/new
router.post('/new', [
  check('name', 'Name must be between 3 and 30 characters and only contain alphanumeric values or low dash').exists().custom(value => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(value);
  }),
  check('password', 'Password must be between 6 and 20 characters').exists().isLength({ min: 6, max: 20 })
],
  async (req, res) => {
    try {
      // Hash password
      req.body.password = bcrypt.hashSync(req.body.password, 10)

      // Create and save to DB the new user
      const user = new User({ name: req.body.name, picture: req.body.picture, password: req.body.password });
      const newUser = await user.save();

      // Create user token with expiry date of authentication
      const userToken = jwt.encode({
        userId: newUser._id,
        expires: moment().add(1, 'days').unix()
      }, process.env.SECRET_KEY);

      // Send back user token and user name
      res.status(200).json({ 'user-token': userToken, user: { name: newUser.name, picture: newUser.picture, id: newUser._id } });

    } catch (err) {
      console.log(err);

      if (err.code === 11000) {
        res.status(500).json({ error: 'Name already exists.' });
      } else {
        res.status(500).json(err);
      }
    }
  });

/* Handle user login */
// http://localhost:3000/users/login
router.post('/login', [
  check('name', 'Name must be between 3 and 30 characters and only contain alphanumeric values or low dash').exists().custom(value => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(value);
  }),
  check('password', 'Password must be between 6 and 20 characters').exists().isLength({ min: 6, max: 20 })
],
  async (req, res) => {
    try {
      const user = new User();

      // Search user in DB
      const foundUser = await user.getByName(req.body.name).exec();

      // If password and hashed password match, create user token with expiry date
      if (bcrypt.compareSync(req.body.password, foundUser.password)) {

        const userToken = jwt.encode({
          userId: foundUser._id,
          expires: moment().add(1, 'days').unix()
        }, process.env.SECRET_KEY);

        res.status(200).json({ 'user-token': userToken });

        // If do not match, return error
      } else {
        res.status(422).json('Username or password do not match');
      }

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  });

/* Get user details */
// http://localhost:3000/users/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = new User();

    const foundUser = await user.getById(req.params.userId).exec();
    res.status(200).json({ user: { ...foundUser } });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

/* Edit user info */
// http://localhost:3000/users/:userId/edit
router.put('/:userId/edit', [
  isUserAuthenticated,
  isUserAuthorized,
  check('name', 'Name must be between 3 and 30 characters and only contain alphanumeric values or low dash').exists().custom(value => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(value);
  }),
  check('password', 'Password must be between 6 and 20 characters').exists().isLength({ min: 6, max: 20 })
], async (req, res) => {
  try {
    const user = new User();

    const result = await user.updateDetails(req.decodedToken.userId, req.body).exec();
    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

/* Delete user */
// http://localhost:3000/users/:userId/delete
router.delete('/:userId/delete', [isUserAuthenticated, isUserAuthorized], async (req, res) => {
  try {
    // Check if user is requesting to delete it's own profile
    if (req.params['userId'] === req.decodedToken.userId) {
      const user = new User();

      const result = await user.deleteById(req.decodedToken.userId).exec();
      res.status(200).json(result);

    } else {
      res.status(401).json({ error: 'User credentials do not match' });
    }

  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
