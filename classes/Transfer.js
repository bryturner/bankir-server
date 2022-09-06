class Transfer {
	amount;
	date;
	description;
	type;
	id;
	intAmount;

	constructor(amount, date, description, type) {
		this.amount = amount;
		this.date = date;
		this.description = description;
		this.type = type;

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
	transaction;
	message;
	balance;
	accountTotal;

	constructor(amount, date, description, type, account, intAmount) {
		super(amount, date, description, type, intAmount);

		this.account = account;

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
		const transactionId = `t-to${this.id}`;
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
	transactionTo;
	transactionFrom;
	message;
	balance;
	accountTotal;

	constructor(
		amount,
		date,
		description,
		type,
		transferFrom,
		transferTo,
		intAmount
	) {
		super(amount, date, description, type, intAmount);

		this.transferFrom = transferFrom;
		this.transferTo = transferTo;

		this.#createMessage();
		this.#createTransactionFrom();
	}

	#createMessage() {
		const messageId = `msg${this.id}`;
		this.message = {
			type: this.type,
			transferFrom: this.transferFrom,
			transferTo: this.transferTo,
			date: this.date,
			amount: this.amount,
			id: messageId,
		};
	}

	#createTransactionFrom() {
		const transactionId = `t-fm${this.id}`;
		this.transactionFrom = {
			date: this.date,
			description: this.description,
			amount: this.intAmount,
			id: transactionId,
		};
	}

	createTransactionTo() {
		const transactionId = `t-to${this.id}`;
		this.transactionTo = {
			date: this.date,
			description: this.description,
			amount: this.intAmount,
			id: transactionId,
		};
		return this.transactionTo;
	}

	updateFromBalance(balance) {
		return balance - this.intAmount;
	}

	updateToBalance(balance) {
		return balance + this.intAmount;
	}

	updateAccountTotal(accountTotal) {
		return accountTotal - this.intAmount;
	}

	updateOtherUserBalance(balance) {
		return balance + this.intAmount;
	}

	updateOtherUserTotal(total) {
		return total + this.intAmount;
	}

	createOtherUserMessage(user) {
		const messageId = `msg${this.id}`;
		return {
			type: this.type,
			transferFrom: user,
			transferTo: 'standard',
			date: this.date,
			amount: this.amount,
			id: messageId,
		};
	}
}

module.exports = { Transaction, AccountTransfer };
