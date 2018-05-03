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
		info.call = () => ({ version: WeebAPI.get('version'), message: `Welcome to the ${WeebAPI.get('name')} API` });
		routes.push(info);
		if (WeebAPI.get('permNodes')) {
			const permnode = new Route('ALL', '/permnode', [], false);
			permnode.call = () => ({ apiIdentifier: `${WeebAPI.get('name')}-${WeebAPI.get('config').env}`, permNodes: WeebAPI.get('permNodes') });
			routes.push(permnode);
		}

		super('Service', routes, errorHandler);
	}
}

module.exports = ServiceRouter;
