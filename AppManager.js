const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const errors = require('./helps/error');

const {officeSchema} = require('./schems/ind.js');

const OfficeService = require('./svcs/office');
const LoggerService = require('./svcs/logger');
const CacheService = require('./svcs/cache');

module.exports = (db, config) => {
	const app = express();

	// Services
	const officeService = new OfficeService(db.offices, officeSchema, errors);
	const loggerService = new LoggerService();
	const cacheService = new CacheService();

	// Controllers
	const logger = require('./global-controllers/logger')(loggerService);
	const cache = require('./global-controllers/cache')(cacheService, loggerService);
	const apiController = require('./controllers/office')(
			officeService,
			cacheService,
	);

	// Mounting
	app.use(express.static('public'));
	app.use(cookieParser(config.cookie.key));
	app.use(bodyParser.json());

	app.use('/offices', logger);
	app.use('/offices', cache);
	app.use('/offices', apiController);

	return app;
};
