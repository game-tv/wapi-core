'use strict';

const path = require('path');
const winston = require('winston');

class WeebAPI {
	static init() {
		const data = new Map();

		let pkg;
		let config;
		let permNodes;

		try {
			pkg = require(path.resolve('package.json'));
		} catch (e) {
			winston.error('Failed to require package.json for Weeb API');
			process.exit(1);
		}
		try {
			config = require(path.resolve('config/main.json'));
		} catch (e) {
			winston.error('Failed to require config/main.json for WeebAPI');
			process.exit(1);
		}
		try {
			permNodes = require(path.resolve('permNodes.json'));
		} catch (e) {
			winston.warn('Could not find permNodes.json! /permnode will not be available.');
		}

		data.set('name', pkg.name);
		data.set('version', pkg.version);
		data.set('serviceName', pkg.serviceName);
		data.set('config', config);
		data.set('permNodes', permNodes);

		this._data = data;
		this._initialized = true;
	}

	static get(property) {
		return this._data.get(property);
	}

	static set(property, value) {
		this._data.set(property, value);
	}

	static get initialized() {
		return this._initialized;
	}
}

WeebAPI._data = null;
WeebAPI._initialized = false;

module.exports = WeebAPI;
