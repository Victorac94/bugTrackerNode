const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const moment = require('moment');

const Comment = require('../models/comment');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/isUserAuthorized');

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
        const comment = new Comment({ ...req.body, author: req.decodedToken.userId });

        const result = await comment.save();

        res.status(200).json(result);

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

        const result = await comment.deleteComment(req.params['commentId']);

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err });
    }
});


module.exports = router;