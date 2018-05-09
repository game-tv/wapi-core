'use strict';

const { Router: ExpressRouter } = require('express');
const winston = require('winston');

const { HTTPCodes } = require('../Constants');
const Route = require('./Route');
const Util = require('../utils/Util');

class Router {
	/**
	 * Creates a new Router
	 *
	 * @param {string} name The name of this router
	 * @param {Route[]} routes The Routes to be registered on this router
	 * @param {(e: Error, req: Express.Request, res: Express.Response) => void} errorHandler A custom error handler for handling route errors
	 */
	constructor(name, routes, errorHandler) {
		this._name = name;
		this._routes = routes;
		this._router = new ExpressRouter();

		// Check for error handler, otherwise use default one
		if (!errorHandler || typeof errorHandler !== 'function') {
			errorHandler = Util.getDefaultErrorHandler();
		}
		this._errorHandler = errorHandler;

		this._init();
	}

	get name() {
		return this._name;
	}

	/**
	 * Registeres this router on an express app
	 * @param {Express.Application} app The express app
	 */
	register(app) {
		app.use(this._router);

		winston.info(`Registered router "${this.name}"`);
	}

	_init() {
		for (let route of this._routes) {
			// Check if we have a class or an instance first
			if (!(route instanceof Route)) {
				// We have no Route instance so we're trying to instantiate it
				try {
					// eslint-disable-next-line new-cap
					route = new route();
				} catch (e) {
					winston.warn(`Could not instantiate a given route. Skipping...`);
					winston.warn(e);
					continue;
				}
			}

			// Check if it is an instance of Route
			if (!(route instanceof Route)) {
				winston.warn(`A given route does not extend class Route. Skipping...`);
				continue;
			}

			// Register on ExpressRouter for every alias there is
			for (const alias of route.aliases) {
				// Validate the aliases method
				if (!Route.Methods.includes(alias.method)) {
					winston.warn(`Route alias ${alias.method} ${alias.path} has an invalid HTTP method. Skipping...`);
					continue;
				}

				// Register
				this._router[alias.method.toLowerCase()](alias.path, this._wrapRoute(route, alias));

				winston.info(`Registered route ${alias.method} ${alias.path} on router "${this.name}"`);
			}
		}
	}

	_wrapRoute(route, alias) {
		return async (req, res) => {
			try {
				// Permission check and abort if no perms
				if (!Util.checkPermissions(req.account, route.permissions, route.requireAccount)) {
					return res.status(HTTPCodes.FORBIDDEN).json(Util.buildMissingScopeMessage(
						req.appName || 'unset',
						req.config ? req.config.env : 'unset',
						route.permissions,
					));
				}

				// Forward call and handle its response
				const routeRes = await route.call(req, res, alias);
				if (routeRes) {
					const response = Util.getResponse(routeRes);
					res.status(response.status).json(response);
				}
			} catch (e) {
				this._errorHandler(e, req, res);
			}
		};
	}
}

module.exports = Router;
