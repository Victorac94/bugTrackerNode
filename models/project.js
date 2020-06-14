const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, minlength: 1, maxlength: 50 },
    modification_date: { type: Number, default: null },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]
});

// Get all projects
projectSchema.methods.getAll = function () {
    return this.model('Project').find({});
}

// Get project by it's mongo id
projectSchema.methods.getProjectById = function (projectId) {
    return this.model('Project').findById(projectId);
}

// Get populated issues from a specific project
projectSchema.methods.getProjectIssues = function (projectId) {
    return this.model('Project').findById(projectId).populate('issues');
}

// Add issue to a specific project
projectSchema.methods.addIssue = function (projectId, issueId) {
    return this.model('Project').findOneAndUpdate({ _id: projectId }, { $push: { issues: issueId } });
}

// Edit project info
projectSchema.methods.editProject = function (projectId, data) {
    return this.model('Project').updateOne({ _id: projectId }, { ...data });
}

// Delete project
projectSchema.methods.deleteProject = function (projectId) {
    return this.model('Project').deleteOne({ _id: projectId });
}


module.exports = mongoose.model('Project', projectSchema);