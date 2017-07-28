'use strict';

const pkg = require('../../package.json');
const superagent = require('superagent');

const BaseMiddleware = require('./base.middleware');
const { HTTPCodes } = require('../constants');

class AccountAPIMiddleware extends BaseMiddleware {
    constructor(urlBase, sendErrors, uagent) {
        super();
        this.urlBase = urlBase || 'http://localhost:9010';
        this.sendErrors = sendErrors !== undefined ? sendErrors : true;
        this.uagent = uagent || `wapi-core Account API Middleware v${pkg.version}`;
        console.log(this.uagent);
    }

    async exec(req) {
        // Get token
        if (!req.headers || !req.headers.authorization) return this.sendErrors ? HTTPCodes.UNAUTHORIZED : HTTPCodes.OK;
        let authHeader = req.headers.authorization;
        if (!authHeader.startsWith('Bearer ')) return this.sendErrors ? HTTPCodes.UNAUTHORIZED : HTTPCodes.OK;
        let jwtoken = authHeader.split('Bearer ')[1];
        if (jwtoken === '') return this.sendErrors ? HTTPCodes.UNAUTHORIZED : HTTPCodes.OK;

        let response;
        try {
            response = await superagent
            .get(`${this.urlBase}/validate/${encodeURIComponent(jwtoken)}`)
            .set('User-Agent', this.uagent)
            .set('Content-Type', 'application/json')
            .send();
            if (response.code !== HTTPCodes.OK && response.code !== HTTPCodes.UNAUTHORIZED) throw Error();
            if (response.code !== HTTPCodes.OK) return this.sendErrors ? HTTPCodes.UNAUTHORIZED : HTTPCodes.OK;
        } catch (e) {
            return this.sendErrors ? { code: HTTPCodes.INTERNAL_SERVER_ERROR, message: 'Failed to contact Account API' } : HTTPCodes.OK;
        }

        console.log(response.body);
    }
}

module.exports = AccountAPIMiddleware;
