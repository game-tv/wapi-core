'use strict';

const axios = require('axios');
const shortid = require('shortid');

const WeebAPI = require('../WeebAPI');

class Registrator {
	constructor() {
		if (!WeebAPI.get('config').registration) {
			throw new Error('Invalid configuration: config.registration does not exist');
		}

		const headers = {};

		if (WeebAPI.get('config').registration.token) {
			headers['X-Consul-Token'] = WeebAPI.get('config').registration.token;
		}
		this.agent = axios.create({ baseURL: `http://${WeebAPI.get('config').registration.host}/v1/`, headers });
		this.id = shortid.generate();
	}

	async register() {
		if (!WeebAPI.initialized) {
			throw new Error('Initialize the WeebAPI class to use this method');
		}

		return this.agent.put('/agent/service/register', { name: WeebAPI.get('serviceName'), id: `${WeebAPI.get('serviceName')}-${this.id}`, tags: [WeebAPI.get('config').env], port: WeebAPI.get('config').port, checks: WeebAPI.get('config').registration.checks });
	}

	async unregister() {
		return this.agent.put(`/agent/service/deregister/${WeebAPI.get('serviceName')}-${this.id}`);
	}
}

module.exports = Registrator;
