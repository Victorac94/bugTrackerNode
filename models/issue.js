const mongoose = require('mongoose');
const moment = require('moment');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
    informer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    category: { type: String, maxlength: 50 },
    creation_date: { type: Number, default: moment().unix() },
    modification_date: { type: Number, default: null },
    priority: { type: String, default: 'low' },
    state: { type: String, default: 'open' },
    severity: { type: String, default: 'low' },
    summary: { type: String, minlength: 1, maxlength: 200, required: true },
    description: { type: String, maxlength: 30000, required: true },
    steps_to_reproduce: { type: String, maxlength: 30000 },
    product_version: { type: String, maxlength: 100 },
    os: { type: String, maxlength: 100 },
    tags: { type: String, maxlength: 30 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

issueSchema.methods.getAll = function () {
    return this.model('Issue').find({}).sort({ creation_date: -1 }).populate('informer project');
}

issueSchema.methods.getIssueById = function (issueId) {
    return this.model('Issue').findById(issueId).populate('project');
}

issueSchema.methods.getFullIssue = function (issueId) {
    return this.model('Issue').findById(issueId).populate({ path: 'informer project comments', populate: 'author' });
}

issueSchema.methods.getIssueByInformer = function (informerId) {
    return this.model('Issue').find({ informer: informerId }).populate('project informer');
}

issueSchema.methods.searchIssueByCustomId = function (issueId) {
    return this.model('Issue').find({ id: issueId });
}

issueSchema.methods.searchIssueBySummary = function (summary) {
    return this.model('Issue').find({ summary: { $regex: summary, $options: 'i' } });
}

issueSchema.methods.updateIssue = function (issueId, data) {
    return this.model('Issue').updateOne({ _id: issueId }, { ...data });
}

issueSchema.methods.addComment = function (issueId, commentId) {
    return this.model('Issue').updateOne({ _id: issueId }, { $push: { comments: commentId } });
}

issueSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Issue', issueSchema);