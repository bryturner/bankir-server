const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const Account = require('../models/account.model');
const { deposit } = require('../helpers');
const { Transaction, AccountTransfer } = require('../classes/Transfer');

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

		// check isDefault for delete account button
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
		const { amount, date, description, type, transferFrom, transferTo } =
			req.body;

		if (!description || !date || !amount) {
			res.json({ errorMessage: 'Please fill out all fields' });
		}

		const accountInfo = await Account.findOne({ user: user });

		const { accountTotal } = accountInfo;

		// amount, date, description, type, transferFrom, transferTo
		const transfer = new AccountTransfer(
			amount,
			date,
			description,
			type,
			transferFrom,
			transferTo
		);

		// === Other user transfer -> check username and update ===
		if (transferTo !== 'premium' || transferTo !== 'standard') {
			const otherUser = await Account.findOne({ user: otherUser });

			if (!otherUser) {
				res.json({
					errorMessage: 'Username not found, please check spelling',
				});
			}

			const { accountTotal } = otherUser;
			const { balance } = otherUser.standard;

			// update other user balance, total, transaction, message
			const newUserBalance = transfer.updateOtherUserBalance(balance);

			const newUserTotal = transfer.updateOtherUserTotal(accountTotal);

			const newUserMessage = transfer.createOtherUserMessage(user);

			const newUserTransaction = transfer.createTransactionTo();
		}

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

router.get('/checkOther', verifyToken, async (req, res) => {
	try {
		const user = res.locals.id;

		const currentUser = await Account.findOne({ user: user });

		res.status(200).json();
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
});

module.exports = router;
