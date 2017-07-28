'use strict';

const BaseRouter = require('./base.router');

class WildcardRouter extends BaseRouter {
    constructor() {
        super();

        this.all('*', async() => 404);
    }
}

module.exports = WildcardRouter;
