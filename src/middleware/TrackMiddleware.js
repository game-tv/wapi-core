'use strict';

const ua = require('universal-analytics');

const Middleware = require('./Middleware');

class TrackMiddleware extends Middleware {
	constructor(weebApi, errorHandler) {
		if (!weebApi.loaded) {
			throw new Error('Cannot instantiate TrackMiddleware without loaded WeebAPI class');
		}

		super('TrackMiddleware', errorHandler, async req => {
			let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			if (req.headers['CF-Connecting-IP']) {
				ip = req.headers['CF-Connecting-IP'];
			}
			const ipList = ip.split(',');
			if (ipList.length > 0) {
				ip = ipList[0];
			}

			const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

			let uid;
			if (req.account) {
				uid = req.account.id;
			}

			const visitor = ua(weebApi.get('track'), { https: true });
			const trackingData = {
				uid,
				uip: ip,
				ua: req.headers['user-agent'],
				dl: fullUrl,
				an: `${weebApi.get('name')}_${weebApi.get('env')}`,
				av: weebApi.get('version'),
			};
			if (req.account) {
				const extraData = {
					cd1: req.account.discordUserId,
					cd2: req.account.id,
					cd3: req.account.name,
				};
				Object.assign(trackingData, extraData);
			}

			visitor.pageview(trackingData, err => {
				if (err) {
					errorHandler(err);
				}
			});
		});
	}
}

module.exports = TrackMiddleware;
