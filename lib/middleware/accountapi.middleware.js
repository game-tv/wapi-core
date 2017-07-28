'use strict';

const { BaseMiddleware } = require('wapi-core');
const { HTTPCodes } = require('wapi-core').Constants;

class AccountAPIAuthMiddleware extends BaseMiddleware {
    async exec(req) {

    }
}

module.exports = AccountAPIAuthMiddleware;
