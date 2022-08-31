const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {
	ACCOUNT,
	MESSAGES,
	PREMIUM,
	STANDARD,
} = require('../constants/accountDefaults');
const Account = require('../models/account.model');

// // Register new user
router.post('/register', async (req, res) => {
	try {
		const { firstName, username, password, passwordVerify } = req.body;

		if (!firstName || !username || !password || !passwordVerify)
			return res
				.status(400)
				.json({ errorMessage: 'Please enter all required fields' });

		if (password.length < 8)
			return res.status(400).json({
				errorMessage: 'Password must be at least 8 characters long',
			});

		if (password !== passwordVerify)
			return res.status(400).json({
				errorMessage: 'Please enter the same password twice',
			});

		const existingUsername = await User.findOne({ username });
		if (existingUsername)
			return res.status(400).json({
				errorMessage: 'An account with this username already exists',
			});

		const salt = await bcrypt.genSalt();

		const passwordHash = await bcrypt.hash(password, salt);

		const newUser = new User({
			firstName,
			username,
			passwordHash,
		});

		const savedUser = await newUser.save();

		const token = jwt.sign(
			{
				user: savedUser._id,
			},
			process.env.JWT_SECRET
		);

		res
			.cookie('token', token, {
				httpOnly: true,
			})
			.send(savedUser);
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

// Register new user
// router.post('/register', async (req, res) => {
// 	try {
// 		const { firstName, username, password, passwordVerify } = req.body;

// 		if (!firstName || !username || !password || !passwordVerify)
// 			return res
// 				.status(400)
// 				.json({ errorMessage: 'Please enter all required fields' });

// 		if (password.length < 8)
// 			return res.status(400).json({
// 				errorMessage: 'Password must be at least 8 characters long',
// 			});

// 		if (password !== passwordVerify)
// 			return res.status(400).json({
// 				errorMessage: 'Please enter the same password twice',
// 			});

// 		const existingUsername = await User.findOne({ username });
// 		if (existingUsername)
// 			return res.status(400).json({
// 				errorMessage: 'An account with this username already exists',
// 			});

// 		const salt = await bcrypt.genSalt();

// 		const passwordHash = await bcrypt.hash(password, salt);

// 		const account = ACCOUNT;

// 		const messages = MESSAGES;

// 		const newUser = new User({
// 			firstName,
// 			username,
// 			passwordHash,
// 			account,
// 			messages,
// 		});

// 		const savedUser = await newUser.save();

// 		const token = jwt.sign(
// 			{
// 				user: savedUser._id,
// 			},
// 			process.env.JWT_SECRET
// 		);

// 		const user = savedUser._id;
// 		const premium = PREMIUM;
// 		const standard = STANDARD;
// 		const accountTotal = 15000;
// 		const earningsTotal = 700;

// 		const newAccount = new Account({
// 			user,
// 			standard,
// 			premium,
// 			accountTotal,
// 			earningsTotal,
// 			messages,
// 		});

// 		const savedAccount = await newAccount.save();

// 		res
// 			.cookie('token', token, {
// 				httpOnly: true,
// 				// expires: new Date(Date.now() + 8 * 3600000),
// 			})
// 			.send(savedAccount);
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).send();
// 	}
// });
// Log in user
router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password)
			return res
				.status(400)
				.json({ errorMessage: 'Please enter all required fields' });

		const existingUser = await User.findOne({ username });

		if (!existingUser)
			return res.status(401).json({
				errorMessage: 'Username or password is incorrect',
			});

		const passwordCorrect = await bcrypt.compare(
			password,
			existingUser.passwordHash
		);

		if (!passwordCorrect)
			return res.status(401).json({
				errorMessage: 'Username or password is incorrect',
			});

		const token = jwt.sign(
			{
				user: existingUser._id,
			},
			process.env.JWT_SECRET
		);

		res
			.cookie('token', token, {
				httpOnly: true,
			})
			.send(existingUser);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			errorMessage: 'Error in POST login',
		});
	}
});

// Log out user
router.get('/logout', (req, res) => {
	res
		.status(200)
		.cookie('token', '', {
			httpOnly: true,
			expires: new Date(0),
		})
		.send();
});

// Check if user is logged in
router.get('/isLoggedIn', (req, res) => {
	try {
		const token = req.cookies.token;

		if (!token) return res.json(false);

		jwt.verify(token, process.env.JWT_SECRET);

		res.send(true);
	} catch (err) {
		res.json(false);
	}
});

module.exports = router;