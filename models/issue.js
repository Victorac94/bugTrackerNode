const mongoose = require('mongoose');
const moment = require('moment');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueSchema = new mongoose.Schema({
    informer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    category: { type: String, minlength: 1, maxlength: 50, required: true },
    creation_date: { type: Number, default: moment().unix() },
    modification_date: { type: Number, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    state: { type: String, enum: ['open', 'closed'], default: 'open' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    summary: { type: String, minlength: 1, maxlength: 200, required: true },
    description: { type: String, minlength: 1, maxlength: 30000, required: true },
    steps_to_reproduce: { type: String, maxlength: 30000 },
    product_version: { type: String, minlength: 1, maxlength: 50, required: true },
    os: { type: String, maxlength: 50 },
    tags: { type: String, minlength: 1, maxlength: 30, enum: ['feature', 'bug'], default: 'bug' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// Get all issues
issueSchema.methods.getAll = function () {
    return this.model('Issue').find({}).sort({ creation_date: -1 }).populate('informer project');
}

// Get issue by it's mongo id
issueSchema.methods.getIssueById = function (issueId) {
    return this.model('Issue').findById(issueId).populate('project');
}

// Get full issue's details by it's mongo id
issueSchema.methods.getFullIssue = function (issueId) {
    return this.model('Issue').findById(issueId).populate({ path: 'informer project comments', populate: { path: 'author' } });
}

// Get issue by it's informer mongo id
issueSchema.methods.getIssueByInformer = function (informerId) {
    return this.model('Issue').find({ informer: informerId }).populate('project informer');
}

// Get issue by it's custom id (numeric autoincrement) (mongoose-sequence package)
issueSchema.methods.searchIssueByCustomId = function (issueId) {
    return this.model('Issue').find({ id: issueId });
}

// Get issue by searching for a matching string in it's summary
issueSchema.methods.searchIssueBySummary = function (summary) {
    return this.model('Issue').find({ summary: { $regex: summary, $options: 'i' } });
}

// Update issue with new data
issueSchema.methods.updateIssue = function (issueId, data) {
    return this.model('Issue').updateOne({ _id: issueId }, { ...data });
}

// Delete issue
issueSchema.methods.deleteIssue = function (issueId) {
    return this.model('Issue').deleteOne({ _id: issueId });
}

// Toggle issue state (open/closed)
issueSchema.methods.toggleIssueState = function (issueId, state) {
    return this.model('Issue').updateOne({ _id: issueId }, { $set: { state: state } });
}

// Add comment to issue
issueSchema.methods.addComment = function (issueId, commentId) {
    return this.model('Issue').updateOne({ _id: issueId }, { $push: { comments: commentId } });
}

// Delete comment from issue
issueSchema.methods.deleteComment = function (issueId, commentId) {
    return this.model('Issue').updateOne({ _id: issueId }, { $pull: { comments: commentId } })
}

issueSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Issue', issueSchema);