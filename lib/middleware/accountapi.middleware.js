'use strict';

const pkg = require('../../package.json');
const axios = require('axios');

const BaseMiddleware = require('./base.middleware');
const {HTTPCodes} = require('../constants');

class AccountAPIMiddleware extends BaseMiddleware {
    constructor(urlBase, uagent) {
        super();
        this.urlBase = urlBase || 'http://localhost:9010';
        this.uagent = uagent || `Account API Middleware on wapi-core v${pkg.version}`;
    }

    async exec(req) {
        if (!req.headers || !req.headers.authorization) return HTTPCodes.UNAUTHORIZED;
        let authHeader = req.headers.authorization;
        if (!authHeader.startsWith('Bearer ')) return HTTPCodes.UNAUTHORIZED;
        let jwtoken = authHeader.split('Bearer ')[1];
        if (jwtoken === '') return HTTPCodes.UNAUTHORIZED;

        let response;
        try {
            response = await axios({
                url: `${this.urlBase}/validate/${encodeURIComponent(jwtoken)}`,
                method: 'get',
                headers: {'User-Agent': this.uagent},
            });
        } catch (e) {
            if (e.response && e.response.status !== HTTPCodes.OK) return HTTPCodes.UNAUTHORIZED;
            return {code: HTTPCodes.INTERNAL_SERVER_ERROR, message: 'Failed to contact Account API'};
        }

        if (!response.data.account) return HTTPCodes.UNAUTHORIZED;
        req.account = response.data.account;
        return HTTPCodes.OK;
    }
}

module.exports = AccountAPIMiddleware;
