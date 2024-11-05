const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }, // Make email unique
    password: String,
    level: { type: String, enum: ['beginner' ,'intermediate' ,'advanced'] }, // 1, 2, 3, or 4
    domainOfInterest: { type: String, enum: ['Web Development', 'App Development', 'Machine Learning', 'JAVA', 'C++', 'DSA'] },
    languageMode: { type: String, enum: ['English', 'Hindi'] }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
