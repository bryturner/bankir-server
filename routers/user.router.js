const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/user.model');

// Delete user
router.delete('/deleteUser', verifyToken, async (req, res) => {
	try {
		const { user } = req.cookies;

		await User.findByIdAndDelete(user);
		res.status(200).json('User has been deleted');
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

// add to account, update account balance, update account totals, create message
router.put('/transaction', verifyToken, async (req, res) => {
	try {
		const { user } = req.cookies;
		const { account, type, amount, date } = req.body;

		const existingUser = await User.findById(user);

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

router.put('/transfer', verifyToken, async (req, res) => {
	try {
		const { user } = req.cookies;
		const { toAccount, fromAccount, amount, date } = req.body;

		const existingUser = await User.findById(user);

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

// create message for any transaction and return the message
// { type, date}
// types, welcome, transfer, withdrawl, deposit
router.put('/message', verifyToken, async (req, res) => {
	try {
		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

module.exports = router;
