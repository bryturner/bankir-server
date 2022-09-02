const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const Account = require('../models/account.model');
const { deposit } = require('../helpers');

router.get('/', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const accountInfo = await Account.findOne({ user: user });

		res.send(accountInfo);
	} catch (err) {
		res.json(err);
	}
});

router.post('/newAccount', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;

		const standard = {
			balance: 10000,
			transactions: [],
			apy: 2.5,
			earnings: 200,
		};

		const premium = {
			balance: 5000,
			transactions: [],
			apy: 5.5,
			earnings: 500,
		};

		const accountTotal = 15000;
		const earningsTotal = 700;
		const messages = [{ type: 'welcome', date: Date.now() }];

		const newAccount = new Account({
			user,
			standard,
			premium,
			accountTotal,
			earningsTotal,
			messages,
		});

		const savedAccount = await newAccount.save();
		res.send(savedAccount);
	} catch (err) {
		res.json(err);
	}
});

// add to account, update account balance, update account totals, create message
router.put('/transaction', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const { amount } = req.body;

		const accountInfo = await Account.findOne({ user: user });

		const newBalance = deposit(accountInfo, amount);

		const testAccount = await Account.updateOne(
			{ user: user },
			{
				$set: { standard: { balance: newBalance } },
			}
		);
		res.send(testAccount);
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

router.put('/transfer', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const { toAccount, fromAccount, amount, date } = req.body;

		const existingUser = await Account.findOne({ user: user });

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

// create message for any transaction and return the message
// {message, type, date}
router.put('/message', verifyToken, async (req, res) => {
	try {
		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

module.exports = router;
