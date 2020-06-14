const mongoose = require('mongoose');
const moment = require('moment');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    text: { type: String, minlength: 1, maxlength: 30000 },
    creation_date: { type: Number, default: moment().unix() },
    modification_date: { type: Number, default: null }
});

// Get all comments
commentSchema.methods.getAll = function (issueId) {
    return this.model('Comment').find({ issue: issueId }).populate('author');
}

// Get comment by it's mongodb id
commentSchema.methods.getCommentById = function (commentId) {
    return this.model('Comment').findById(commentId);
}

// Get comment by it's author's id
commentSchema.methods.getCommentByAuthor = function (authorId) {
    return this.model('Comment').find({ author: authorId }).populate('author issue');
}

// Get information of the comment just created
commentSchema.methods.getCreatedComment = function (commentId) {
    return this.model('Comment').findOne({ _id: commentId }).populate('author issue');
}

// Edit comment
commentSchema.methods.editComment = function (commentId, data) {
    return this.model('Comment').updateOne({ _id: commentId }, { ...data });
}

// Delete comment
commentSchema.methods.deleteComment = function (commentId) {
    return this.model('Comment').deleteOne({ _id: commentId });
}

// Delete issue's comments
commentSchema.methods.deleteIssueComments = function (issueId) {
    return this.model('Comment').deleteMany({ issue: issueId });
}

module.exports = mongoose.model('Comment', commentSchema);