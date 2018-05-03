'use strict';

require('./utils/Util').configureWinston(require('winston'));

module.exports = {
	Async: require('./utils/Async'),
	Constants: require('./Constants'),
	FileCache: require('./utils/FileCache'),
	IrohMiddleware: require('./middleware/IrohMiddleware'),
	Middleware: require('./middleware/Middleware'),
	PermMiddleware: require('./middleware/PermMiddleware'),
	Registrator: require('./application/Registrator'),
	Require: require('./utils/Require'),
	Route: require('./router/Route'),
	Router: require('./router/Router'),
	ServiceRouter: require('./router/ServiceRouter'),
	ShutdownHandler: require('./application/ShutdownHandler'),
	Util: require('./utils/Util'),
	WeebAPI: require('./WeebAPI'),
	WildcardRouter: require('./router/WildcardRouter'),
};
