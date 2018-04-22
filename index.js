'use strict'

// Middleware
module.exports.BaseMiddleware = require('./lib/middleware/base.middleware')
module.exports.AccountAPIMiddleware = require('./lib/middleware/accountapi.middleware')
module.exports.PermMiddleware = require('./lib/middleware/perm.middleware')
module.exports.TrackingMiddleware = require('./lib/middleware/tracking.middleware')

// Routers
module.exports.BaseRouter = require('./lib/routers/base.router')
module.exports.BaseTwoRouter = require('./lib/routers/basetwo.router');
module.exports.GenericRouter = require('./lib/routers/generic.router')
module.exports.WildcardRouter = require('./lib/routers/wildcard.router')

// Other stuff
module.exports.Constants = require('./lib/constants')
module.exports.Utils = require('./lib/utils')
module.exports.Logger = require('./lib/logger')
module.exports.Registrator = require('./lib/registrator')
module.exports.Errors = {
  HttpError: require('./lib/structures/errors/HttpError'),
}

module.exports.ShutdownHandler = require('./lib/shutdownHandler')
