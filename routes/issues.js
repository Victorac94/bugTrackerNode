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

/* Get issue details */
// http://localhost:3000/issues/:issueId
router.get('/:issueId',
    check('issueId', 'Issue id must be a correct Mongodb id').isMongoId()
    , async (req, res) => {
        try {
            const issue = new Issue();

            const foundIssue = await issue.getFullIssue(req.params['issueId']);

            res.status(200).json({ issue: foundIssue });

        } catch (err) {
            res.status(500).json(err);
        }
    })

/* Add new issue */
// http://localhost:3000/issues/new
router.post('/new', [
    isUserAuthenticated,
    check('project', 'Project id is not valid or has not been provided').exists({ checkNull: true, checkFalsy: true }),
    check('category', 'Category is not valid').exists(),
    check('priority', 'Priority value is not valid').exists(),
    check('severity', 'Severity value is not valid').exists().isAlpha(),
    check('summary', 'Summary value must be present and must be between 1 and 200 characters').exists().isLength({ min: 1, max: 200 }),
    check('description', 'Description must be present and must be between 1 and 30000 characters').exists({ checkNull: true, checkFalsy: true }).isLength({ min: 1, max: 30000 }),
    check('steps_to_reproduce', 'Steps to reproduce if present must be between 1 and 30000 characters').isLength({ min: 1, max: 30000 }),
    check('product_version', 'Product version must be present and must be between 1 and 50 characters').exists().isLength({ min: 1, max: 50 }),
    check('os', 'OS must be present and must be between 1 and 50 characters').isLength({ min: 1, max: 50 }),
    check('tags', 'Tags must be present and must be between 1 and 30 characters').exists().isLength({ min: 1, max: 30 })
], async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array());
        }

        const myIssue = {
            ...req.body,
            informer: req.decodedUserToken._id,
            state: 'open'
        }

        const issue = new Issue({ ...myIssue });
        const project = new Project();
        const user = new User();

        const newIssue = await issue.save();
        const newProjectIssue = await project.addIssue(req.body.project, newIssue._id);
        const addedIssueToUser = await user.addIssue(myIssue.informer, newIssue._id);

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
    check('category', 'Category is not valid').exists(),
    check('priority', 'Priority value is not valid').exists(),
    check('severity', 'Severity value is not valid').exists().isAlpha(),
    check('summary', 'Summary value must be present and must be between 1 and 200 characters').exists().isLength({ min: 1, max: 200 }),
    check('description', 'Description must be present and must be between 1 and 30000 characters').exists({ checkNull: true, checkFalsy: true }).isLength({ min: 1, max: 30000 }),
    check('steps_to_reproduce', 'Steps to reproduce if present must be between 1 and 30000 characters').isLength({ min: 1, max: 30000 }),
    check('product_version', 'Product version must be present and must be between 1 and 50 characters').exists().isLength({ min: 1, max: 50 }),
    check('os', 'OS must be present and must be between 1 and 50 characters').isLength({ min: 1, max: 50 }),
    check('tags', 'Tags must be present and must be between 1 and 30 characters').exists().isLength({ min: 1, max: 30 })
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