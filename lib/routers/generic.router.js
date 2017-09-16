'use strict';

const BaseRouter = require('./base.router');

class GenericRouter extends BaseRouter {
    constructor(version, message, apiIdentifier = 'nya', permNodes = []) {
        super();

        this.all('/', async() => ({version, message}));
        this.all('/permnode', async() => ({apiIdentifier, permNodes}));
    }
}

module.exports = GenericRouter;
