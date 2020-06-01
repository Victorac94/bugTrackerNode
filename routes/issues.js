const express = require('express');
const router = express.Router();
const moment = require('moment');
const { check, validationResult } = require('express-validator');

const Issue = require('../models/issue');
const Project = require('../models/project');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');

/* Get latest issues */
// http://localhost:3000/issues
router.get('/', (req, res) => {
    res.send('Showing all issues');
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
    check('summary', 'Summary value must be present and can only contain alphabetic and or numeric values').custom(value => /^[a-zA-Z0-9_ ]{3, 30}$/.test(value)),
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

        const newIssue = await issue.save();
        const newProjectIssue = await project.addIssue(req.body.project, newIssue._id);

        res.status(200).json({ issue: newIssue, project: newProjectIssue });

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