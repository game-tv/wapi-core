'use strict';

const util = require('util');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const Raven = require('raven');
const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');

const Require = require('./utils/Require');
const Registrator = require('./utils/Registrator');
const IrohMiddleware = require('./middleware/IrohMiddleware');
const PermMiddleware = require('./middleware/PermMiddleware');
const TrackMiddleware = require('./middleware/TrackMiddleware');
const ServiceRouter = require('./router/ServiceRouter');
const Sentry = require('./utils/Sentry');
const WildcardRouter = require('./router/WildcardRouter');
const Redis = require('./utils/Redis');
const { HTTPCodes } = require('./Constants');

class WeebAPI {
	/**
	 * Creates a new WeebAPI
	 *
	 * @param {object} config The configuration
	 * @param {boolean} config.enableAccounts Enables or disables accounts and perm checking, default: enabled
	 */
	constructor(config) {
		this._config = Object.assign({
			enableAccounts: true,
		}, config);

		this._data = null;
		this._loaded = false;
		this._initialized = false;

		this._registrator = null;
		this._server = null;
		this._mongoose = null;
		this._redis = null;
		this._sentry = null;
	}

	async init() {
		if (this.initialized) {
			return;
		}

		// Register error hooks
		process.on('SIGTERM', () => this.shutdown());
		process.on('SIGINT', () => this.shutdown());
		process.on('unhandledRejection', (reason, promise) => {
			winston.error(util.inspect(promise, { depth: 4 }));
		});

		try {
			await this.onLoad();
			await this._loadConfig();
			await this.onLoaded();

			this._sentry = new Sentry(this);
			this._registrator = new Registrator(this);
			if (this.get('redis') && this.get('redis') !== '') {
				this._redis = new Redis(this.get('redis'));
			}

			await this._startExpress();

			await this._registrator.register();

			this._initialized = true;
			await this.onInitialized();
		} catch (e) {
			// Initialization error, we kill everything!!!
			this._loaded = false;
			this._initialized = false;

			winston.error(e);
			winston.error('Failed to initialize.');
			process.exit(1);
		}
	}

	/**
	 * Called whenever an error happens in a route or middleware
	 * This has a default handler but can be overridden if wanted
	 *
	 * @param {Error} error The error
	 * @param {Express.Request=} req The current request
	 * @param {Express.Response=} res The current response
	 */
	onError(error, req, res) {
		try {
			if (req && req.Raven) {
				Raven.captureException(error, err => {
					winston.error(err);
				});
			}
			winston.error(error);
		} catch (e) {
			// Ignore
		}

		if (res) {
			res.status(HTTPCodes.INTERNAL_SERVER_ERROR).json({
				status: HTTPCodes.INTERNAL_SERVER_ERROR,
				message: 'Internal Server Error',
			});
		}
	}

	/**
	 * Called at the top of the init function
	 */
	async onLoad() {}

	/**
	 * Called after all configuration has been loaded. Use this if you want to modify the config during runtime.
	 */
	async onLoaded() {}

	/**
	 * Used to register middlewares from the API
	 *
	 * @param {Express.Application} app The express application
	 */
	// eslint-disable-next-line no-unused-vars
	async registerMiddlewares(app) {}

	/**
	 * Used to register routers from the API
	 *
	 * @param {Express.Application} app The express application
	 */
	// eslint-disable-next-line no-unused-vars
	async registerRouters(app) {}

	/**
	 * Called after the entire initialization routine is done
	 */
	async onInitialized() {}

	get(property) {
		return this._data.get(property);
	}

	set(property, value) {
		this._data.set(property, value);
	}

	get loaded() {
		return this._loaded;
	}

	get initialized() {
		return this._initialized;
	}

	get accountsEnabled() {
		return this._config.enableAccounts;
	}

	get sentry() {
		return this._sentry;
	}

	get redis() {
		return this._redis;
	}

	shutdown(errors) {
		errors = errors || [];

		if (this._registrator && this.get('serviceName')) {
			return this._registrator.unregister(this.get('serviceName'))
				.then(() => {
					this._registrator = null;
					this.shutdown(errors);
				}).catch(e => {
					this._registrator = null;
					this.errors.push(e);
					this.shutdown(errors);
				});
		}
		if (this._server) {
			return new GracefulShutdownManager(this._server).terminate(() => {
				this._server = null;
				this.shutdown(errors);
			});
		}
		if (this._mongoose) {
			return this._mongoose.connection.close(() => {
				this._mongoose = null;
				this.shutdown(errors);
			});
		}

		if (errors.length > 0) {
			for (const error of this.errors) {
				winston.error(error);
			}
			process.exit(1);
		} else {
			process.exit(0);
		}
	}

	async _startExpress() {
		// Initialize express
		const app = express();

		// Register some middlewares
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(cors());

		// Config middleware
		app.use((req, res, next) => {
			req.weeb = this;
			Object.defineProperty(req, 'Raven', {
				get: () => {
					winston.warn('Using req.Raven is deprecated and will be removed in the future! Use req.sentry instead.');
					return this._sentry;
				},
			});
			req.sentry = this._sentry;
			req.redis = this._redis;
			next();
		});

		// WeebAPI middlewares
		if (this._config.enableAccounts) {
			new IrohMiddleware(this, this.onError.bind(this)).register(app);
		}
		if (this.get('track')) {
			new TrackMiddleware(this, this.onError.bind(this)).register(app);
		}
		if (this._config.enableAccounts) {
			new PermMiddleware(this, this.onError.bind(this)).register(app);
		}

		// User middlewares
		await this.registerMiddlewares(app);

		// WeebAPI routers
		new ServiceRouter(this, this.onError.bind(this)).register(app);

		// User routers
		await this.registerRouters(app);

		// Wildcard router comes last
		new WildcardRouter(this.onError.bind(this)).register(app);

		// Start express
		this._server = app.listen(this.get('port'), this.get('host'));
		winston.info(`Server started on ${this.get('host')}:${this.get('port')}`);
	}

	async _loadConfig() {
		const data = new Map();

		await this._loadPackage(data);
		await this._loadMainCfg(data);
		await this._loadPermNodes(data);

		this._data = data;
		this._loaded = true;
		winston.info('Config loaded');
	}

	async _loadPackage(data) {
		let pkg;
		try {
			pkg = await Require.asyncJSON('package.json');
		} catch (e) {
			throw new Error('Failed to require package.json for Weeb API');
		}

		data.set('name', pkg.name);
		data.set('version', pkg.version);
		data.set('serviceName', pkg.serviceName || null);

		return data;
	}

	async _loadMainCfg(data) {
		let config;
		try {
			config = await Require.asyncJSON('config/main.json');
		} catch (e) {
			throw new Error('Failed to require config/main.json for WeebAPI');
		}

		data.set('host', config.host || '127.0.0.1');
		data.set('port', config.port || 8080);
		data.set('env', config.env || 'development');
		// TODO Remove config.ravenKey in the future
		data.set('sentry', config.sentry || config.ravenKey || null);
		data.set('redis', config.redis || null);
		data.set('mongodb', config.mongodb || null);
		data.set('track', config.track || null);
		data.set('irohHost', config.irohHost || 'http://localhost:9010');
		data.set('registration', config.registration || {});
		data.set('whitelist', config.whitelist || []);

		return data;
	}

	async _loadPermNodes(data) {
		let permNodes;
		try {
			permNodes = await Require.asyncJSON('permNodes.json');
		} catch (e) {
			winston.warn('Could not find permNodes.json! /permnode will not be available.');
		}

		data.set('permNodes', permNodes || null);

		return data;
	}
}

module.exports = WeebAPI;
