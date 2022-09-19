const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

dotenv.config();

const url = process.env.DB_CONNECTION;

let client;

const getClient = async () => {
	if (client && client.isConnected()) {
		console.log('DB is already connected');
	} else
		try {
			client = await MongoClient.connect(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			console.log('Connected to DB');
		} catch (err) {
			throw err;
		}
	return client;
};

module.exports = getClient;
// MongoClient.connect(
// 	process.env.DB_CONNECTION,
// 	{ useNewUrlParser: true, useUnifiedTopology: true },
// 	err => (err ? console.error(err) : console.log('Connected to DB'))
// );
