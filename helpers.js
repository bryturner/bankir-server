const deposit = (accountInfo, amount) => {
	const { balance } = accountInfo.standard;
	return balance + amount;
};

module.exports = { deposit };
