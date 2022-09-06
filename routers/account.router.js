const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const Account = require('../models/account.model');
const { deposit } = require('../helpers');
const { Transaction } = require('../account');

router.get('/', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const dbAccount = await Account.findOne({ user: user });

		const {
			firstName,
			standard,
			premium,
			accountTotal,
			earningsTotal,
			messages,
		} = dbAccount;

		const accountInfo = {
			firstName: firstName,
			standard: standard,
			premium: premium,
			accountTotal: accountTotal,
			earningsTotal: earningsTotal,
			messages: messages,
		};

		res.send(accountInfo);
	} catch (err) {
		res.json(err);
	}
});

router.post('/newAccount', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;

		const firstName = req.body.firstName.trim().replace(/\s{2,}/g, '');

		if (!firstName) {
			return res
				.status(400)
				.json({ errorMessage: 'Please fill out all required fields' });
		}

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
		const messages = [
			{ firstName: firstName, type: 'welcome', date: Date.now() },
		];

		const newAccount = new Account({
			user,
			firstName,
			standard,
			premium,
			accountTotal,
			earningsTotal,
			messages,
		});

		await newAccount.save();

		res.send();
	} catch (err) {
		res.json({ errorMessage: 'New account could not be created' });
	}
});

// "user":"631283ae68279932c9275f80",
// add to account, update account balance, update account totals, create message
router.put('/transaction', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const { amount, date, type, account, description } = req.body;

		if (!description || !date || !amount) {
			res.json({ errorMessage: 'Please fill out all fields' });
		}

		// amount, date, type, account, description ....
		const transaction = new Transaction(
			amount,
			date,
			type,
			account,
			description
		);

		const accountInfo = await Account.findOne({ user: user });

		const { accountTotal } = accountInfo;

		if (account === 'standard') {
			const { balance } = accountInfo.standard;

			const newBalance = transaction.updateBalance(balance);
			const newAccountTotal = transaction.updateAccountTotal(accountTotal);
			const newMessage = transaction.message;
			const newTransaction = transaction.transaction;

			await Account.updateOne(
				{ user: user },
				{
					$set: {
						standard: { balance: newBalance },
						accountTotal: newAccountTotal,
					},
					$push: {
						messages: newMessage,
					},
				}
			);

			await Account.updateOne(
				{ user: user },
				{
					$push: {
						'standard.transactions': newTransaction,
					},
				}
			);

			res.send();
		}

		if (account === 'premium') {
			const { balance } = accountInfo.premium;

			const newBalance = transaction.updateBalance(balance);
			const newAccountTotal = transaction.updateAccountTotal(accountTotal);
			const newMessage = transaction.message;
			const newTransaction = transaction.transaction;

			await Account.updateOne(
				{ user: user },
				{
					$set: {
						premium: { balance: newBalance },
						accountTotal: newAccountTotal,
					},
					$push: {
						messages: newMessage,
					},
				}
			);

			await Account.updateOne(
				{ user: user },
				{
					$push: {
						'premium.transactions': newTransaction,
					},
				}
			);

			res.send();
		}
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

// type transfer
router.put('/transfer', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;
		const { transferFrom, transferTo, amount, date, description } = req.body;

		// check transferTo value if Another user

		if (!description || !date || !amount) {
			res.json({ errorMessage: 'Please fill out all fields' });
		}

		const accountInfo = await Account.findOne({ user: user });

		const { accountTotal } = accountInfo;

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

router.get('/checkOther', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;

		const currentUser = await Account.findOne({});

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

module.exports = router;
