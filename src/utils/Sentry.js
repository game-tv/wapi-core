'use strict';

const winston = require('winston');
const { Client } = require('raven');

class Sentry {
	constructor(weebApi) {
		this._enabled = weebApi.get('sentry') && weebApi.get('sentry') !== '' && weebApi.get('env') !== 'development';
		if (this._enabled) {
			this._raven = new Client(weebApi.get('sentry'), {
				release: weebApi.get('version'),
				environment: weebApi.get('env'),
				captureUnhandledRejections: true,
			});

			this._raven.install((err, sendErr, eventId) => {
				if (!sendErr) {
					winston.info('Successfully sent fatal error with eventId ' + eventId + ' to Sentry:');
					winston.error(err.stack);
				}
				winston.error(sendErr);
				process.exit(1);
			});

			this._raven.on('error', e => {
				winston.error('Raven Error', e);
			});
			winston.info('Enabled Sentry');
		}
	}

	get enabled() {
		return this._enabled;
	}

	captureException(...args) {
		if (!this._enabled) {
			return;
		}

		this._raven.captureException(...args);
	}
}

module.exports = Sentry;
