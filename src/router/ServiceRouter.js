'use strict';

const Router = require('./Router');
const Route = require('./Route');

class ServiceRouter extends Router {
	constructor(weebApi, errorHandler) {
		if (!weebApi.loaded) {
			throw new Error('Cannot instantiate ServiceRouter without loaded WeebAPI class');
		}

		const routes = [];

		const info = new Route('ALL', '/', [], false);
		info.call = () => ({ version: weebApi.get('version'), message: `Welcome to the ${weebApi.get('name')} API` });
		routes.push(info);
		if (weebApi.get('permNodes')) {
			const permnode = new Route('ALL', '/permnode', [], false);
			permnode.call = () => ({ apiIdentifier: `${weebApi.get('name')}-${weebApi.get('config').env}`, permNodes: weebApi.get('permNodes') });
			routes.push(permnode);
		}

		super('Service', routes, errorHandler);
	}
}

module.exports = ServiceRouter;
