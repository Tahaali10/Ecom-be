const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: false }
});

// Pre-save middleware to hash password before storing it in the database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10); // Changed to 10 for salt rounds
        // Hash the password using the salt
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Hashed password:', this.password);  // Log hashed password for debugging
        next();
    } catch (err) {
        return next(err);
    }
});

// Method to validate password
UserSchema.methods.isValidPassword = async function(plainPassword) {
    try {
        return await bcrypt.compare(plainPassword, this.password);
    } catch (err) {
        throw new Error('Error comparing passwords: ' + err.message);
    }
};

// Create and export the User model
module.exports = mongoose.model('User', UserSchema);
