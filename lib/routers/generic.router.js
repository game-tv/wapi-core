'use strict';

const BaseRouter = require('./base.router');

class GenericRouter extends BaseRouter {
    constructor(version, message) {
        super();

        this.all('/', async() => ({ version, message }));
    }
}

module.exports = GenericRouter;
