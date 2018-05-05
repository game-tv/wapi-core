'use strict';

const axios = require('axios');

const Middleware = require('./Middleware');
const { HTTPCodes } = require('../Constants');

class IrohMiddleware extends Middleware {
	constructor(weebApi, errorHandler) {
		if (!weebApi.loaded) {
			throw new Error('Cannot instantiate IrohMiddleware without loaded WeebAPI class');
		}

		const urlBase = weebApi.get('config').irohHost || 'http://localhost:9010';
		const uagent = weebApi.get('uagent') || `${weebApi.get('name')}-${weebApi.get('config').env}`;

		super('IrohMiddleware', errorHandler, async req => {
			if (!req.headers || !req.headers.authorization) {
				return HTTPCodes.UNAUTHORIZED;
			}
			const authHeader = req.headers.authorization;
			if (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('Wolke ')) {
				return HTTPCodes.UNAUTHORIZED;
			}
			let token;
			let wolkeToken = false;
			if (authHeader.startsWith('Bearer ')) {
				token = authHeader.split('Bearer ')[1];
			} else {
				token = authHeader.split('Wolke ')[1];
				wolkeToken = true;
			}
			if (token === '') {
				return HTTPCodes.UNAUTHORIZED;
			}
			let response;
			try {
				response = await axios({
					url: `${urlBase}/validate/${encodeURIComponent(token)}${wolkeToken ? '?wolkeToken=true' : ''}`,
					method: 'get',
					headers: { 'User-Agent': uagent },
				});
			} catch (e) {
				if (e.response && e.response.status !== HTTPCodes.OK) {
					return HTTPCodes.UNAUTHORIZED;
				}
				return { status: HTTPCodes.INTERNAL_SERVER_ERROR, message: 'Failed to contact Account API' };
			}

			if (!response.data.account) {
				return HTTPCodes.UNAUTHORIZED;
			}
			req.account = response.data.account;
			return HTTPCodes.OK;
		});

		const whitelist = weebApi.get('config').whitelist;
		if (whitelist && whitelist.length > 0) {
			for (let i = 0; i < whitelist.length; i++) {
				this.whitelist(whitelist[i].path, whitelist[i].method);
			}
		}
	}
}

module.exports = IrohMiddleware;
