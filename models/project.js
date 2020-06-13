const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, minlength: 1, maxlength: 50 },
    modification_date: { type: Number, default: null },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }]
});

projectSchema.methods.getAll = function () {
    return this.model('Project').find({});
}

projectSchema.methods.getProjectById = function (projectId) {
    return this.model('Project').findById(projectId);
}

projectSchema.methods.getProjectIssues = function (projectId) {
    return this.model('Project').findById(projectId).populate('issues');
}

projectSchema.methods.addIssue = function (projectId, issueId) {
    return this.model('Project').findOneAndUpdate({ _id: projectId }, { $push: { issues: issueId } });
}

projectSchema.methods.editProject = function (projectId, data) {
    return this.model('Project').updateOne({ _id: projectId }, { ...data });
}

projectSchema.methods.deleteProject = function (projectId) {
    return this.model('Project').deleteOne({ _id: projectId });
}


module.exports = mongoose.model('Project', projectSchema);