const Issue = require('../models/issue');
const Project = require('../models/project');
const Comment = require('../models/comment');

const isUserAuthorized = async (req, res, next) => {
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

            // For modifying projects
        } else if (req.params['projectId']) {
            const project = new Project();

            const foundProject = await project.getProjectById(req.params['projectId']);

            // User can modify project
            if (foundProject.creator.toString() === req.decodedToken.userId) {
                console.log('Can update project');
                next();

                // User is not authorized to modify project
            } else {
                res.status(401).json('Access unauthorized.');
            }

            // For modifying comments
        } else if (req.params['commentId']) {
            const comment = new Comment();

            const foundComment = await comment.getCommentById(req.params['commentId']);

            // User can modify comment
            if (foundComment.author.toString() === req.decodedToken.userId) {
                console.log('Can update comment');
                next();

                // User is not authorized to modify comment
            } else {
                res.status(401).json('Access unauthorized.');
            }
        }

    } catch (err) {
        res.status(500).json(err);
    }
}

module.exports = isUserAuthorized;