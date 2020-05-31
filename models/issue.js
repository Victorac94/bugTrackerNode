const mongoose = require('mongoose');
const moment = require('moment');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
    informer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    project: { type: String, required: true },
    category: String,
    creation_date: { type: Number, default: moment().unix() },
    modification_date: { type: Number, default: null },
    priority: { type: String, default: 'low' },
    state: { type: String, default: 'open' },
    severity: { type: String, default: 'low' },
    summary: { type: String, minlength: 3, maxlength: 30, required: true },
    description: { type: String, maxlength: 5000, required: true },
    steps_to_reproduce: String,
    product_version: String,
    os: String,
    tags: String,
});

issueSchema.methods.getProjectIssues = function (projectId) {
    return this.model('Issue').find({ project: projectId });
}

issueSchema.methods.getIssueById = function (issueId) {
    return this.model('Issue').findById(issueId);
}

issueSchema.methods.updateIssue = function (issueId, data) {
    return this.model('Issue').updateOne({ _id: issueId }, { ...data });
}

issueSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Issue', issueSchema);