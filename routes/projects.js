const express = require('express');
const router = express.Router();
const moment = require('moment');
const { check, validationResult } = require('express-validator');

const Project = require('../models/project');
const isUserAuthenticated = require('../middlewares/isUserAuthenticated');
const isUserAuthorized = require('../middlewares/IsUserAuthorized');
const isUserLoggedIn = require('../middlewares/isUserLoggedIn');

/* Get all projects */
// http:localhost:3000/projects
router.get('/', isUserLoggedIn, async (req, res) => {
    try {
        const project = new Project();

        const allProjects = await project.getAll();

        res.status(200).json({ projects: allProjects, isLoggedIn: req.isLoggedIn });

    } catch (err) {
        res.status(500).json(err);
    }
});

/* Add new project */
// http:localhost:3000/projects/new
router.post('/new', [
    isUserAuthenticated,
    check('name', 'Project\'s name must only contain letters, numbers or underscore and have at least a length of 2').matches(/^[a-zA-Z0-9_ ]{2,}$/)
],
    async (req, res) => {
        try {
            // Check request for validation errors
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json(errors.array());
            }

            // Create the project and save it to the DB
            const project = new Project({ ...req.body, creator: req.decodedToken.userId });

            const newProject = await project.save();

            res.status(200).json(newProject);

        } catch (err) {
            res.status(500).json(err);
        }
    });

/* Edit project */
// http:localhost:3000/projects/:projectId/edit
router.put('/:projectId/edit', [
    isUserAuthenticated,
    isUserAuthorized,
    check('name', 'Project\'s name must only contain letters, numbers or underscore and have at least a length of 2').matches(/^[a-zA-Z0-9_ ]{2,}$/)
],
    async (req, res) => {
        try {
            // Check request for validation errors
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json(errors.array());
            }

            const project = new Project();

            // Edit project
            const data = {
                name: req.body.name,
                modification_date: moment().unix()
            };
            const result = await project.editProject(req.params['projectId'], data);

            res.status(200).json(result);

        } catch (err) {
            res.status(500).json(err);
        }
    });

/* Delete project */
// http:localhost:3000/projects/:projectId/delete
router.delete('/:projectId/delete', [
    isUserAuthenticated,
    isUserAuthorized
], async (req, res) => {
    try {
        const project = new Project();

        const result = await project.deleteProject(req.params['projectId']);

        res.status(200).json(result);

    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;