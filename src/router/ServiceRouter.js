'use strict';

const Router = require('./Router');
const Route = require('./Route');
const WeebAPI = require('../WeebAPI');

class ServiceRouter extends Router {
	constructor(errorHandler) {
		if (!WeebAPI.initialized) {
			throw new Error('Cannot instantiate ServiceRouter without initialized WeebAPI class');
		}

		const routes = [];

		const info = new Route('ALL', '/', [], false);
		info.call = () => ({ version: WeebAPI.pkg.version, message: `Welcome to the ${WeebAPI.pkg.name} API` });
		routes.push(info);
		if (WeebAPI.permNodes) {
			const permnode = new Route('ALL', '/permnode', [], false);
			permnode.call = () => ({ apiIdentifier: `${WeebAPI.pkg.name}-${WeebAPI.config.env}`, permNodes: WeebAPI.permNodes });
			routes.push(permnode);
		}

		super('Service', routes, errorHandler);
	}
}

module.exports = ServiceRouter;
