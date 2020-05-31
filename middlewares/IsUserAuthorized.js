const Issue = require('../models/issue');

async function isUserAuthorized(req, res, next) {
    try {
        // For modifying issues
        if (req.params['issueId']) {
            const issue = new Issue();

            const foundIssue = await issue.getIssueById(req.params['issueId']);

            // User is authorized
            if (foundIssue.informer.toString() === req.decodedToken.userId) {
                console.log('Authorization success');
                next();

                // User is not authorized
            } else {
                res.status(401).json('Access unauthorized.');
            }

            // For modifying users
        } else if (req.params['userId']) {
            // User is authorized
            if (req.params['userId'] === req.decodedToken.userId) {
                console.log('Authorization success');
                next();

                // User is not authorized
            } else {
                res.status(401).json('Access unauthorized.');
            }
        }

    } catch (err) {
        res.status(500).json({ error: err });
    }
}

module.exports = isUserAuthorized;