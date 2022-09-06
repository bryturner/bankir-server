class Account {
	constructor(accountTotal, earningsTotal, amount, type) {}
}

class StandardAccount extends Account {
	// static apy
	constructor(accountInfo, amount) {
		super(accountInfo);
		this.amount = amount;
	}
}

// Where to add transactions for each account
// transaction = date, description, amount, id
// AccountTransfer = Transfer to user1 or Transfer from Standard to Premium
// Transaction = user description

// message = date, amount, type, id, accounts
// AccountTransfer = Transfered $5,000 from Standard to user1, Transfered $5,000 from Standard to Premium
// Transaction = Withdrawal of $5,000 from Standard, Deposit of $5,000 to premium
class Transfer {
	id;
	intAmount;
	date;

	constructor(amount, date) {
		this.amount = amount;
		this.date = date;

		this.#createId();
		this.#convertAmount();
	}

	#createId() {
		const dt = new Date(Date.now()).toISOString();
		this.id = dt.slice(dt.indexOf('-') + 1, -1);
	}

	#convertAmount() {
		this.intAmount = parseFloat(this.amount.replace(/,/g, ''));

		if (this.intAmount <= 0) {
			throw new Error('Amount cannot be less than or equal to 0');
		}
		return this.intAmount;
	}
}

class Transaction extends Transfer {
	account;
	type;
	description;
	transaction;
	message;
	balance;
	accountTotal;

	// constructor(amount, date, balance, accountTotal, intAmount, account, type) {
	constructor(amount, date, type, account, description, intAmount) {
		super(amount, date, intAmount);

		this.type = type;
		this.account = account;
		this.description = description;

		this.#createMessage();
		this.#createTransaction();
	}

	#update(value) {
		if (this.type === 'withdrawal') {
			return value - this.intAmount;
		} else if (this.type === 'deposit') {
			return value + this.intAmount;
		} else {
			throw new Error(`Type "${this.type}" does not exist`);
		}
	}

	#createMessage() {
		const messageId = `msg${this.id}`;
		this.message = {
			type: this.type,
			date: this.date,
			amount: this.amount,
			id: messageId,
		};
	}

	#createTransaction() {
		const transactionId = `ta${this.id}`;
		this.transaction = {
			date: this.date,
			description: this.description,
			amount: this.intAmount,
			id: transactionId,
		};
	}

	updateBalance(balance) {
		this.balance = this.#update(balance);
		return this.balance;
	}

	updateAccountTotal(accountTotal) {
		this.accountTotal = this.#update(accountTotal);
		return this.accountTotal;
	}
}

class AccountTransfer extends Transfer {
	transferFrom;
	transferTo;
	account;
	description;
	transaction;
	message;
	balance;
	accountTotal;

	constructor(
		transferFrom,
		transferTo,
		amount,
		date,
		account,
		description,
		intAmount
	) {
		super(amount, date, intAmount);

		this.transferFrom = transferFrom;
		this.transferTo = transferTo;
		this.account = account;
		this.description = description;

		this.#createMessage();
		this.#createFromTransfer();
	}

	#update(value) {
		if (this.transferTo === 'standard' || this.transferTo === 'premium') {
			return this.intAmount;
		}
	}

	#createMessage() {
		const messageId = `msg${this.id}`;
		this.message = {
			transferFrom: this.transferFrom,
			transferTo: this.transferTo,
			date: this.date,
			amount: this.amount,
			id: messageId,
		};
	}

	#createFromTransfer() {
		const transactionId = `t-fm${this.id}`;
		this.transaction = {
			date: this.date,
			description: this.description,
			amount: this.intAmount,
			id: transactionId,
		};
	}

	#createToTransfer() {
		const transactionId = `t-to${this.id}`;
		this.transaction = {
			date: this.date,
			description: this.description,
			amount: this.intAmount,
			id: transactionId,
		};
	}

	updateFromBalance(balance) {
		this.balance = balance - this.intAmount;
		return this.balance;
	}

	updateAccountTotal(accountTotal) {
		this.accountTotal = this.#update(accountTotal);
		return this.accountTotal;
	}
}

module.exports = { Transaction };
