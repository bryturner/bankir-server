const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const User = mongoose.model('user', userSchema);

module.exports = User;
