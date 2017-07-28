'use strict';

const BaseRouter = require('./base.router');

const { HTTPCodes } = require('../constants');

class WildcardRouter extends BaseRouter {
    constructor() {
        super();

        this.all('*', async() => HTTPCodes.NOT_FOUND);
    }
}

module.exports = WildcardRouter;
