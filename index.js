'use strict';

// Set up winston
const winston = require('winston');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp: true,
    colorize: true,
});

// Middleware
module.exports.BaseMiddleware = require('./lib/middleware/base.middleware');
module.exports.AccountAPIMiddleware = require('./lib/middleware/accountapi.middleware');
module.exports.PermMiddleware = require('./lib/middleware/perm.middleware');

// Routers
module.exports.BaseRouter = require('./lib/routers/base.router');
module.exports.GenericRouter = require('./lib/routers/generic.router');
module.exports.WildcardRouter = require('./lib/routers/wildcard.router');

// Other stuff
module.exports.Constants = require('./lib/constants');
module.exports.Utils = require('./lib/utils');
