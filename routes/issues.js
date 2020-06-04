const express = require('express');
const router = express.Router();
const moment = require('moment');
const { check, validationResult } = require('express-validator');

const Issue = require('../models/issue');
const Project = require('../models/project');
const User = require('../models/user');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');

/* Get latest issues and issues by search */
// http://localhost:3000/issues?search=<id|summary>
router.get('/', async (req, res) => {
    try {
        const issue = new Issue();
        let foundIssues;

        // If performing a search of issues
        if (req.query.search) {
            console.log('if');
            // Trim search input and check if it is a valid search
            req.query.search = req.query.search.trim();

            if (req.query.search === '') {
                res.status(422).json('Search query is invalid.');
            }

            // If search is a string
            if (isNaN(req.query.search)) {
                foundIssues = await issue.searchIssueBySummary(req.query.search);

                // If it's the issue custom id (number)
            } else {
                foundIssues = await issue.searchIssueByCustomId(req.query.search);
            }


            // Get all issues
        } else {
            foundIssues = await issue.getAll();
        }

        // Return foundIssues
        res.status(200).json(foundIssues);

    } catch (err) {
        res.status(500).json({ error: err });
    }
})

/* Add new issue */
// http://localhost:3000/issues/new
router.post('/new', [
    isUserAuthenticated,
    check('informer', 'Provided informer id is not a valid id').isMongoId().exists({ checkNull: true, checkFalsy: true }),
    check('project', 'Project id is not valid or has not been provided').exists({ checkNull: true, checkFalsy: true }),
    check('category', 'Category is not valid').isAlpha(),
    check('priority', 'Priority value is not valid').isAlpha(),
    check('state', 'State value is not valid').isAlpha(),
    check('severity', 'Severity value is not valid').isAlpha(),
    check('summary', 'Summary value must be present and can only contain alphabetic and or numeric values').isLength({ min: 3, max: 30 }),
    check('description', 'Description must not exceed 5000 characters').isLength({ max: 5000 }).exists({ checkNull: true, checkFalsy: true }),
    check('steps_to_reproduce', 'Steps to reproduce must not exceed 2000 characters').isLength({ max: 2000 }),
    check('product_version', 'Product version must not exceed 50 characters').isLength({ max: 50 }),
    check('os', 'OS must not exceed 50 characters').isLength({ max: 50 }),
    check('tags', 'Tags must not exceed 50 characters').isLength({ max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        const issue = new Issue({ ...req.body });
        const project = new Project();
        const user = new User();

        const newIssue = await issue.save();
        const newProjectIssue = await project.addIssue(req.body.project, newIssue._id);
        const addedIssueToUser = await user.addIssue(req.body.informer, newIssue._id);

        res.status(200).json({ issue: newIssue, project: newProjectIssue, issue: addedIssueToUser });

    } catch (err) {
        res.status(500).json({ error: err });
    }
})

/* Get specific project's issues */
// http:localhost:3000/issues/project/:projectId
router.get('/project/:projectId', async (req, res) => {
    try {
        const project = new Project();

        const projectIssues = await project.getProjectIssues(req.params['projectId']);

        res.status(200).json(projectIssues);

    } catch (err) {
        res.status(500).json({ error: err });
    }
});

/* Update issue description */
// http://localhost:3000/issues/:issueId/edit
router.put('/:issueId/edit', [
    isUserAuthenticated,
    isUserAuthorized,
    check('project', 'Project id is not valid or has not been provided').exists({ checkNull: true, checkFalsy: true }),
    check('category', 'Category is not valid').isAlpha(),
    check('priority', 'Priority value is not valid').isAlpha(),
    check('state', 'State value is not valid').isAlpha(),
    check('severity', 'Severity value is not valid').isAlpha(),
    check('summary', 'Summary value must be present and can only contain alphabetic and or numeric values').matches(/^[a-zA-Z0-9_ ]{3, 30}$/).exists({ checkNull: true, checkFalsy: true }),
    check('description', 'Description must not exceed 5000 characters').isLength({ max: 5000 }).exists({ checkNull: true, checkFalsy: true }),
    check('steps_to_reproduce', 'Steps to reproduce must not exceed 2000 characters').isLength({ max: 2000 }),
    check('product_version', 'Product version must not exceed 50 characters').isLength({ max: 50 }),
    check('os', 'OS must not exceed 50 characters').isLength({ max: 50 }),
    check('tags', 'Tags must not exceed 50 characters').isLength({ max: 50 })
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        const issue = new Issue();

        const result = await issue.updateIssue(req.params['issueId'], { ...req.body, modification_date: moment().unix() });

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err });
    }
});

module.exports = router;