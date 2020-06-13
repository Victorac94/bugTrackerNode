const jwt = require('jwt-simple');
const moment = require('moment');

const isUserAuthenticated = (req, res, next) => {
    const token = jwt.decode(req.headers['user-token'], process.env.SECRET_KEY);

    if (!req.headers['user-token']) {
        res.status(401).json({ error: 'You need to login or register before continuing', isLoggedIn: false });
        return;
    }

    if (token.expires > moment().unix()) {
        req.decodedToken = token;
        req.isLoggedIn = true;
        next();
    } else {
        res.status(401).json({ error: 'Your session has expired', isLoggedIn: false })
    }
}

module.exports = isUserAuthenticated;