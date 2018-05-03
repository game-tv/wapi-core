'use strict';

const path = require('path');
const winston = require('winston');

class WeebAPI {
	static init() {
		try {
			this.pkg = require(path.resolve('package.json'));
		} catch (e) {
			winston.error('Failed to require package.json for service router');
			process.exit(1);
		}
		try {
			this.config = require(path.resolve('config/main.json'));
		} catch (e) {
			winston.error('Failed to require config/main.json for service router');
			process.exit(1);
		}
		try {
			this.permNodes = require(path.resolve('permNodes.json'));
		} catch (e) {
			winston.warn('Could not find permNodes.json! /permnode will not be available.');
		}

		this._initialized = true;
	}

	static get initialized() {
		return this._initialized;
	}
}

WeebAPI._initialized = false;

module.exports = WeebAPI;
