'use strict';

const { Constants: { HTTPCodes, DefaultResponses } } = require('../Constants');

class Util {
	static configureWinston(winston) {
		winston.configure({
			transports: [
				new winston.transports.Console(),
			],
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
			),
		});
	}

	static checkScopes(wantedScope, scopes) {
		if (scopes.indexOf('admin' > -1)) {
			return true;
		}
		for (let i = 0; i < scopes.length; i++) {
			if (wantedScope.startsWith(scopes[i])) {
				return true;
			}
		}
		return false;
	}

	static checkPermissions(account, wantedPermissions, requireAccount = true) {
		if (!account) {
			return !requireAccount;
		}

		if (wantedPermissions.length === 0) {
			return true;
		}
		if (account.perms.all) {
			return true;
		}

		for (const perm of wantedPermissions) {
			if (account.perms[perm]) {
				return true;
			}
		}

		return false;
	}

	static buildMissingScopeMessage(name, env, scopes) {
		if (!Array.isArray(scopes)) {
			scopes = [scopes];
		}
		scopes = scopes.map(s => this.buildFullyQualifiedScope(name, env, s));
		let message = 'Missing scope' + (scopes.length > 1 ? 's' : '');
		message = message + ' ' + scopes.join(' or ');
		return message;
	}

	static buildFullyQualifiedScope(name, env, scope) {
		const fqScope = `${name}-${env}`;
		if (scope !== '') {
			return fqScope + ':' + scope;
		}
		return fqScope;
	}

	static isTrue(value) {
		if (typeof value === 'string') {
			return value === 'true';
		}
		if (typeof value === 'boolean') {
			return value;
		}

		return false;
	}

	static getResponse(response) {
		// If there is no response set we assume we should continue
		if (response == null) {
			return { status: HTTPCodes.OK, message: DefaultResponses[HTTPCodes.OK] };
		}
		// If it's a number we create a default response for the code
		if (typeof response === 'number') {
			return { status: response, message: DefaultResponses[response] };
		}

		// Add response status if not present
		if (!response.status) {
			response.status = HTTPCodes.OK;
		}
		// There must be a message when the code is not 200
		if (response.status !== HTTPCodes.OK && !response.message) {
			response.message = DefaultResponses[response.status];
		}

		return response;
	}
}

module.exports = Util;
