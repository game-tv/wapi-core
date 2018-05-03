'use strict';

const winston = require('winston');

const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;

class ShutdownHandler {
	constructor(server, registrator, mongoose, name) {
		if (server) {
			this.gsm = new GracefulShutdownManager(server);
		}
		this.registrator = registrator;
		this.mongoose = mongoose;
		this.name = name;
		this.errors = [];
	}

	shutdown() {
		if (this.registrator && this.name) {
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
				logger.error(error)
			}
			process.exit(1)
		} else {
			process.exit(0)
		}
	}

	_stopWebserver(cb) {
		this.gsm.terminate(() => cb())
	}

	_stopMongoose(cb) {
		this.mongoose.connection.close(() => cb())
	}

	_unregister(cb) {
		this.registrator.unregister(this.name)
			.then(() => {
				cb()
			})
			.catch((e) => {
				this.errors.push(e)
				cb()
			})
	}
}

module.exports = shutdownHandler;
