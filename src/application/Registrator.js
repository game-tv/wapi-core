'use strict';

const axios = require('axios');
const shortid = require('shortid');

const WeebAPI = require('../WeebAPI');

class Registrator {
	constructor(host, aclToken) {
		const headers = {};
		if (aclToken) {
			headers['X-Consul-Token'] = aclToken;
		}
		this.agent = axios.create({ baseURL: `http://${host}/v1/`, headers });
		this.id = shortid.generate();
	}

	async register(checks) {
		if (!WeebAPI.initialized) {
			throw new Error('Initialize the WeebAPI class to use this method');
		}

		return this.agent.put('/agent/service/register', { name: WeebAPI.pkg.serviceName, id: `${WeebAPI.pkg.serviceName}-${this.id}`, tags: [WeebAPI.config.env], port: WeebAPI.config.port, checks });
	}

	async unregister() {
		return this.agent.put(`/agent/service/deregister/${WeebAPI.pkg.serviceName}-${this.id}`);
	}
}

module.exports = Registrator;
