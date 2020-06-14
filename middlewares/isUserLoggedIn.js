const jwt = require('jwt-simple');
const moment = require('moment');

const isUserLoggedIn = (req, res, next) => {
    const token = jwt.decode(req.headers['user-token'], process.env.SECRET_KEY);

    if (!req.headers['user-token']) {
        req.isLoggedIn = false;
        next();
    }

    if (token.expires > moment().unix()) {
        req.decodedToken = token;
        req.isLoggedIn = true;
        next();
    } else {
        req.decodedToken = token;
        req.isLoggedIn = false;
        next();
    }
}

module.exports = isUserLoggedIn;