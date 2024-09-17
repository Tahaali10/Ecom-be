const mongoose = require('mongoose');

const invalidTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '2h' }
});

const InvalidToken = mongoose.model('InvalidToken', invalidTokenSchema);
module.exports = InvalidToken;
