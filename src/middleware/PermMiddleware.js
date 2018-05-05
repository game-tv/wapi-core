'use strict';

const Middleware = require('./Middleware');
const { HTTPCodes } = require('../Constants');

class PermMiddleware extends Middleware {
	constructor(weebApi, errorHandler) {
		if (!weebApi.loaded) {
			throw new Error('Cannot instantiate PermMiddleware without loaded WeebAPI class');
		}

		const scopeKey = `${weebApi.get('name')}-${weebApi.get('config').env}`;

		super('PermMiddleware', errorHandler, async req => {
			if (!req.account) {
				return HTTPCodes.OK;
			}
			if (!req.account.scopes || req.account.scopes.length === 0) {
				req.account.perms = {};
				return HTTPCodes.OK;
			}

			const perms = {};
			for (let i = 0; i < req.account.scopes.length; i++) {
				if (req.account.scopes[i].startsWith(scopeKey)) {
					const scope = req.account.scopes[i];
					const scopeSplit = scope.split(':');
					if (scopeSplit.length === 1) {
						perms.all = true;
					} else if (scopeSplit.length === 2) {
						perms[scopeSplit[1]] = true;
					}
				}
			}
			if (req.account.scopes.indexOf('admin') > -1) {
				perms.all = true;
			}
			req.account.perms = perms;

			return HTTPCodes.OK;
		});
	}
}

module.exports = PermMiddleware;
