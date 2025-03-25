const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'user' },
    profile: { type: String, default: 'https://www.w3schools.com/howto/img_avatar.png' },
});

module.exports = mongoose.model('User', userSchema);
