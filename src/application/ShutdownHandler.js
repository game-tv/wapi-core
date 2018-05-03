'use strict';

const winston = require('winston');

const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;

const WeebAPI = require('../WeebAPI');

class ShutdownHandler {
	constructor(server, registrator, mongoose) {
		if (server) {
			this.gsm = new GracefulShutdownManager(server);
		}
		this.registrator = registrator;
		this.mongoose = mongoose;
		this.errors = [];
	}

	shutdown() {
		if (this.registrator && WeebAPI.get('serviceName')) {
			return this._unregister(() => {
				this.registrator = null;
				this.shutdown();
			});
		}
		if (this.gsm) {
			return this._stopWebserver(() => {
				this.gsm = null;
				this.shutdown();
			});
		}
		if (this.mongoose) {
			return this._stopMongoose(() => {
				this.mongoose = null;
				this.shutdown();
			});
		}
		if (this.errors.length > 0) {
			for (const error of this.errors) {
				winston.error(error);
			}
			process.exit(1);
		} else {
			process.exit(0);
		}
	}

	_stopWebserver(cb) {
		this.gsm.terminate(() => cb());
	}

	_stopMongoose(cb) {
		this.mongoose.connection.close(() => cb());
	}

	_unregister(cb) {
		this.registrator.unregister(WeebAPI.get('serviceName'))
			.then(() => {
				cb();
			}).catch(e => {
				this.errors.push(e);
				cb();
			});
	}
}

module.exports = ShutdownHandler;
