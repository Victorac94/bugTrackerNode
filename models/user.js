const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_ ]{3,30}$/
    },
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    picture: {
        type: String,
        default: 'https://i1.wp.com/cantademia.com/wp-content/uploads/2018/03/Default-avatar.jpg'
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// Get all users
userSchema.methods.getAll = function () {
    return this.model('User').find({});
}

// Get user by it's email
userSchema.methods.getByEmail = function (email) {
    return this.model('User').findOne({ email: email }).select('+password');
}

// Get user details
userSchema.methods.getById = function (userId) {
    return this.model('User').findById(userId).populate({ path: 'issues comments', populate: 'issue' });
}

// Update user details
userSchema.methods.updateDetails = function (id, payload) {
    return this.model('User').updateOne({ _id: id }, { name: payload.name, picture: payload.picture });
}

// Add issue to user's issues
userSchema.methods.addIssue = function (userId, issueId) {
    return this.model('User').updateOne({ _id: userId }, { $push: { issues: issueId } });
}

// Add comment to user's comments
userSchema.methods.addComment = function (userId, commentId) {
    return this.model('User').updateOne({ _id: userId }, { $push: { comments: commentId } });
}

// Delete user
userSchema.methods.deleteById = function (id) {
    return this.model('User').deleteOne({ _id: id });
}


module.exports = mongoose.model('User', userSchema);