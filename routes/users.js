var express = require('express');
var router = express.Router();
const moment = require('moment');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../models/user.js');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');
const isUserLoggedIn = require('../middlewares/isUserLoggedIn');

/* GET users listing. */
// http://localhost:3000/users
/* router.get('/', async (req, res) => {
  try {
    const user = new User();

    const users = await user.getAll().exec();
    res.status(200).json(users);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}); */

/* Handle user registration */
// http://localhost:3000/users/new
router.post('/new', [
  check('name', 'Name must be between 3 and 30 characters and only contain alphanumeric values or low dash').exists().custom(value => {
    return /^[a-zA-Z0-9_ ]{3,30}$/.test(value);
  }),
  check('email', 'Email format is not correct').custom(value => {
    return /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/.test(value);
  }),
  check('password', 'Password must be between 6 and 20 characters').isLength({ min: 6, max: 20 })
],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
      }

      // Check if the email already exists in DB
      const checkUser = new User();

      const isUserAlreadyRegistered = await checkUser.getByEmail(req.body.email);

      if (isUserAlreadyRegistered) {
        return res.status(422).json('That email is already registered.');
      }

      // Hash password
      req.body.password = bcrypt.hashSync(req.body.password, 10)

      // Create and save to DB the new user
      const user = new User({ name: req.body.name, email: req.body.email, picture: req.body.picture, password: req.body.password });
      const newUser = await user.save();

      // Create user token with expiry date of authentication
      const userToken = jwt.encode({
        userId: newUser._id,
        expires: moment().add(1, 'days').unix()
      }, process.env.SECRET_KEY);

      newUser.password = undefined;

      // Send back user token and user name
      res.status(200).json({ 'user-token': userToken, 'user-info': newUser, isLoggedIn: true });

    } catch (err) {
      console.log(err);

      if (err.code === 11000) {
        res.status(500).json('Name already exists.');
      } else {
        res.status(500).json(err);
      }
    }
  });

/* Handle user login */
// http://localhost:3000/users/login
router.post('/login', [
  check('email', 'Email format is not correct').custom(value => {
    return /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/.test(value);
  }),
  check('password', 'Password must be between 6 and 20 characters').isLength({ min: 6, max: 20 })
],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json(errors.array());
      }

      const user = new User();

      // Search user in DB
      const foundUser = await user.getByEmail(req.body.email).exec();

      if (!foundUser) {
        return res.status(422).json('Email or password is incorrect');
      }

      // If password and hashed password match, create user token with expiry date
      if (bcrypt.compareSync(req.body.password, foundUser.password)) {

        const userToken = jwt.encode({
          userId: foundUser._id,
          expires: moment().add(1, 'days').unix()
        }, process.env.SECRET_KEY);

        foundUser.password = undefined;

        res.status(200).json({ 'user-token': userToken, 'user-info': foundUser, isLoggedIn: true });

        // If do not match, return error
      } else {
        res.status(422).json('Email or password is incorrect');
      }

    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

/* Return if user's login session is still valid and it's profile info */
// http://localhost:3000/users/isLoggedIn
router.get('/isLoggedIn', isUserLoggedIn, async (req, res) => {
  try {
    // Get user info
    const user = new User();

    console.log(req.decodedToken.userId);

    const userInfo = await user.getById(req.decodedToken.userId);

    res.status(200).json({ userInfo: userInfo, isLoggedIn: req.isLoggedIn });

  } catch (err) {
    res.status(500).json(err);
  }
})

/* Get user details */
// http://localhost:3000/users/:userId
router.get('/:userId', isUserLoggedIn, async (req, res) => {
  try {
    const user = new User();

    const foundUser = await user.getById(req.params.userId);
    console.log(foundUser);

    res.status(200).json({ user: foundUser, isLoggedIn: req.isLoggedIn });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/* Edit user info */
// http://localhost:3000/users/:userId/edit
router.put('/:userId/edit', [
  isUserAuthenticated,
  isUserAuthorized,
  check('name', 'Name must be between 3 and 30 characters and only contain alphanumeric values or low dash').custom(value => {
    return /^[a-zA-Z0-9_. ]{3,30}$/.test(value);
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json(errors.array());
    }

    const user = new User();

    const result = await user.updateDetails(req.decodedToken.userId, req.body).exec();
    res.status(200).json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/* Delete user */
// http://localhost:3000/users/:userId/delete
router.delete('/:userId/delete', [isUserAuthenticated, isUserAuthorized], async (req, res) => {
  try {
    const user = new User();

    const result = await user.deleteById(req.decodedToken.userId).exec();
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
