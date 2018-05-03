'use strict';

const WeebAPI = require('../WeebAPI');
const Middleware = require('./Middleware');
const { HTTPCodes } = require('../Constants');

class PermMiddleware extends Middleware {
	constructor(errorHandler) {
		if (!WeebAPI.initialized) {
			throw new Error('Cannot instantiate PermMiddleware without initialized WeebAPI class');
		}

		const scopeKey = `${WeebAPI.get('name')}-${WeebAPI.get('config').env}`;

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
