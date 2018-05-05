'use strict';

const axios = require('axios');
const shortid = require('shortid');

class Registrator {
	constructor(weebApi) {
		this._weebApi = weebApi;
		if (!weebApi.loaded) {
			throw new Error('Initialize the WeebAPI class to use the registrator');
		}
		if (!weebApi.get('config').registration) {
			throw new Error('Invalid configuration: config.registration does not exist');
		}

		const headers = {};

		if (weebApi.get('config').registration.token) {
			headers['X-Consul-Token'] = weebApi.get('config').registration.token;
		}
		this.agent = axios.create({ baseURL: `http://${weebApi.get('config').registration.host}/v1/`, headers });
		this.id = shortid.generate();
	}

	async register() {
		return this.agent.put('/agent/service/register', {
			name: this._weebApi.get('serviceName'),
			id: `${this._weebApi.get('serviceName')}-${this.id}`,
			tags: [this._weebApi.get('config').env],
			port: this._weebApi.get('config').port,
			checks: this._weebApi.get('config').registration.checks,
		});
	}

	async unregister() {
		return this.agent.put(`/agent/service/deregister/${this._weebApi.get('serviceName')}-${this.id}`);
	}
}

module.exports = Registrator;
