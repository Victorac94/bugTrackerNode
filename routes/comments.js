const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const moment = require('moment');

const Comment = require('../models/comment');
const User = require('../models/user');
const Issue = require('../models/issue');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');

/* Get issue's comments */
// http://localhost:3000/comments/issue/:issueId
router.get('/issue/:issueId', async (req, res) => {
    try {
        const comment = new Comment();

        const issueComments = await comment.getAll(req.params['issueId']);

        res.status(200).json(issueComments);

    } catch (err) {
        res.status(500).json({ error: err });
    }
});

/* Add new comment */
// http://localhost:3000/comments/new
router.post('/new', isUserAuthenticated, async (req, res) => {
    try {
        const user = new User();
        const issue = new Issue();

        const receivedComment = {
            author: req.decodedToken.userId,
            issue: req.body.issue,
            text: req.body.text,
            creation_date: moment().unix()
        }

        const comment = new Comment({ ...receivedComment });
        const savedComment = await comment.save();

        const addedComment = await comment.getCreatedComment(savedComment._id);

        const addedCommentToUser = await user.addComment(req.decodedToken.userId, addedComment._id);
        const addedCommentToIssue = await issue.addComment(req.body.issue, addedComment._id)

        res.status(200).json({ comment: addedComment, userComment: addedCommentToUser, issueComment: addedCommentToIssue });

    } catch (err) {
        res.status(500).json({ error: err });
    }
});


/* Edit comment */
// http://localhost:3000/comments/:commentId/edit
router.put('/:commentId/edit', [
    isUserAuthenticated,
    isUserAuthorized,
    check('text', 'Comment length must be between 2 an 3000 characters.')
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(422).json(errors.array());
        }

        const comment = new Comment();

        const result = await comment.editComment(req.params['commentId'], { text: req.body.text, modification_date: moment().unix() });

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err });
    }
});

/* Delete comment */
// http://localhost:3000/comments/:commentId/delete
router.delete('/:commentId/delete', [
    isUserAuthenticated,
    isUserAuthorized
], async (req, res) => {
    try {
        const comment = new Comment();
        const user = new User();
        const issue = new Issue();

        const resultComment = await comment.deleteComment(req.params['commentId']);
        const resultUser = await user.deleteComment(req.decodedToken.userId, req.params['commentId']);
        const resultIssue = await issue.deleteComment(req.headers['issue-id'], req.params['commentId']);

        res.status(200).json({ comment: resultComment, user: resultUser, issue: resultIssue });

    } catch (err) {
        res.status(500).json({ error: err });
    }
});


module.exports = router;