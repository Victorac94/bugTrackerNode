const mongoose = require('mongoose');
const moment = require('moment');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
    text: { type: String, minlength: 2, maxlength: 3000 },
    creation_date: { type: Number, default: moment().unix() },
    modification_date: { type: Number, default: null }
});

commentSchema.methods.getAll = function (issueId) {
    return this.model('Comment').find({ issue: issueId }).populate({ path: 'author', select: '-password' });
}

commentSchema.methods.getCommentById = function (commentId) {
    return this.model('Comment').findById(commentId);
}

commentSchema.methods.editComment = function (commentId, data) {
    return this.model('Comment').updateOne({ _id: commentId }, { ...data });
}

commentSchema.methods.deleteComment = function (commentId) {
    return this.model('Comment').deleteOne({ _id: commentId });
}


// commentSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('Comment', commentSchema);