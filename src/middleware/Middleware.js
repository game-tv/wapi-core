'use strict';

const winston = require('winston');
const UrlPattern = require('url-pattern');

const { HTTPCodes } = require('../Constants');
const Util = require('../utils/Util');

class Middleware {
	/**
	 * Creates a new Middleware
	 *
	 * @param {string} name The name of this middleware
	 * @param {(e: Error, req: Express.Request, res: Express.Response) => void} errorHandler A custom error handler for handling middleware errors
	 * @param {(req: Express.Request, res: Express.Response) => Promise<void | number | { status: number, message?: string }>} executor An optional Executor
	 */
	constructor(name, errorHandler, executor) {
		this._name = name;
		this._whitelistArray = [];
		this._executor = executor || null;

		// Check for error handler, otherwise use default one
		if (!errorHandler || typeof errorHandler !== 'function') {
			errorHandler = Util.getDefaultErrorHandler();
		}
		this._errorHandler = errorHandler;
	}

	get name() {
		return this._name;
	}

	async exec(req, res) {
		if (this._executor) {
			return this._executor(req, res);
		}

		winston.warn(`Middleware "${this.name}" has not overridden the exec handler.`);
		return HTTPCodes.OK;
	}

	whitelist(path, method) {
		this._whitelistArray.push({ pattern: new UrlPattern(path), method: method || 'all' });
	}

	register(app) {
		app.use(this._middleware.bind(this));

		winston.info(`Registered middleware "${this.name}"`);
	}

	async _middleware(req, res, next) {
		try {
			if (req.path) {
				for (let i = 0; i < this._whitelistArray.length; i++) {
					const e = this._whitelistArray[i];
					if (e.pattern.match(req.path.toLowerCase()) && (req.method.toLowerCase() === e.method || e.method === 'all')) {
						return next();
					}
				}
			}

			const response = Util.getResponse(await this.exec(req, res));
			if (response.status === HTTPCodes.OK) {
				return next();
			}

			res.status(response.status).json(response);
		} catch (e) {
			this._errorHandler(e);
		}
	}
}

module.exports = Middleware;
