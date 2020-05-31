const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        dropDups: true,
        match: /^[a-zA-Z0-9_]{3,30}$/
    },
    picture: {
        type: String,
        default: 'https://i1.wp.com/cantademia.com/wp-content/uploads/2018/03/Default-avatar.jpg'
    },
    password: {
        type: String,
        required: true,
    }
});

// Get all users
userSchema.methods.getAll = function () {
    return this.model('User').find({}, { password: 0 });
}

// Get user by it's name
userSchema.methods.getByName = function (name) {
    return this.model('User').where({ name: name }).findOne();
}

// Get user details
userSchema.methods.getById = function (userId) {
    return this.model('User').find({ _id: userId }, { password: 0 });
}

// Update user details
userSchema.methods.updateDetails = function (id, payload) {
    return this.model('User').updateOne({ _id: id }, { name: payload.name, picture: payload.picture });
}

// Delete user
userSchema.methods.deleteById = function (id) {
    return this.model('User').deleteOne({ _id: id });
}


module.exports = mongoose.model('User', userSchema);