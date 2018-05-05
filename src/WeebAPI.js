'use strict';

const util = require('util');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const winston = require('winston');
const Raven = require('raven');
const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');

const Require = require('./utils/Require');
const Registrator = require('./Registrator');
const IrohMiddleware = require('./middleware/IrohMiddleware');
const PermMiddleware = require('./middleware/PermMiddleware');
const TrackMiddleware = require('./middleware/TrackMiddleware');
const ServiceRouter = require('./router/ServiceRouter');
const WildcardRouter = require('./router/WildcardRouter');
const { HTTPCodes } = require('./Constants');

class WeebAPI {
	constructor() {
		this._data = null;
		this._loaded = false;
		this._initialized = false;

		this._registrator = null;
		this._server = null;
		this._mongoose = null;
	}

	// eslint-disable-next-line complexity
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

			// Load config
			const data = new Map();

			let pkg;
			let config;
			let permNodes;
			try {
				pkg = await Require.asyncJSON('package.json');
			} catch (e) {
				throw new Error('Failed to require package.json for Weeb API');
			}
			try {
				config = await Require.asyncJSON('config/main.json');
			} catch (e) {
				throw new Error('Failed to require config/main.json for WeebAPI');
			}
			try {
				permNodes = await Require.asyncJSON('permNodes.json');
			} catch (e) {
				winston.warn('Could not find permNodes.json! /permnode will not be available.');
			}

			data.set('name', pkg.name);
			data.set('version', pkg.version);
			data.set('serviceName', pkg.serviceName || null);
			data.set('host', config.host || '127.0.0.1');
			data.set('port', config.port || 8080);
			data.set('env', config.env || 'development');
			// TODO Remove config.ravenKey in the future
			data.set('sentry', config.sentry || config.ravenKey || null);
			data.set('track', config.track || null);
			data.set('irohHost', config.irohHost || 'http://localhost:9010');
			data.set('registration', config.registration || {});
			data.set('whitelist', config.whitelist || []);
			data.set('permNodes', permNodes || null);

			this._data = data;
			this._loaded = true;

			winston.info('Config loaded.');
			await this.onLoaded();

			// Register error reporting
			const useSentry = this.get('sentry') && this.get('sentry') !== '' && this.get('env') !== 'development';
			if (useSentry) {
				Raven.config(this.get('sentry'), { release: this.get('version'), environment: this.get('env'), captureUnhandledRejections: true })
					.install((err, sendErr, eventId) => {
						if (!sendErr) {
							winston.info('Successfully sent fatal error with eventId ' + eventId + ' to Sentry:');
							winston.error(err.stack);
						}
						winston.error(sendErr);
						process.exit(1);
					});
				Raven.on('error', e => {
					winston.error('Raven Error', e);
				});
				winston.info('Enabled Sentry');
			}

			// Do startup
			if (this.get('registration').enabled) {
				this._registrator = new Registrator(this);
			}

			// Initialize express
			const app = express();

			// Register some middlewares
			app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({ extended: true }));
			app.use(cors());

			// Config middleware
			app.use((req, res, next) => {
				req.weebApi = this;
				if (useSentry) {
					req.Raven = Raven;
				}
				next();
			});

			// WeebAPI middlewares
			new IrohMiddleware(this, this.onError.bind(this)).register(app);
			if (this.get('track')) {
				new TrackMiddleware(this, this.onError.bind(this)).register(app);
			}
			new PermMiddleware(this, this.onError.bind(this)).register(app);

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

			// Register as network service if we have a registrator
			if (this._registrator) {
				await this._registrator.register();
				winston.info(`Registered network service`);
			}

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

	shutdown(errors) {
		errors = errors || [];

		if (this._registrator && this.get('serviceName')) {
			return this.registrator.unregister(this.get('serviceName'))
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
}

module.exports = WeebAPI;
