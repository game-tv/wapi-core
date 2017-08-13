'use strict';
const BaseMiddleware = require('./base.middleware');
const HTTPCodes = require('../constants').HTTPCodes;

class PermMiddleware extends BaseMiddleware {
    constructor(apiName, apiEnv) {
        super();
        this.scopeKey = `${apiName}-${apiEnv}`;
    }

    async exec(req) {
        if (!req.account) {
            return HTTPCodes.OK;
        }
        if (!req.account.scopes || req.account.scopes.length === 0) {
            req.account.perms = {};
            return HTTPCodes.OK;
        }
        let perms = {};
        for (let i = 0; i < req.account.scopes.length; i++) {
            if (req.account.scopes[i].startsWith(this.scopeKey)) {
                let scope = req.account.scopes[i];
                let scopeSplit = scope.split(':');
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
    }
}

module.exports = PermMiddleware;
