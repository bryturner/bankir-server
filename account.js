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
