'use strict';

const axios = require('axios');
const shortid = require('shortid');
const winston = require('winston');

class Registrator {
	constructor(weebApi) {
		this._weebApi = weebApi;
		this._enabled = false;
		if (!weebApi.loaded) {
			throw new Error('Initialize the WeebAPI class to use the registrator');
		}

		if (!weebApi.get('registration').enabled) {
			return;
		}

		const headers = {};

		if (weebApi.get('registration').token) {
			headers['X-Consul-Token'] = weebApi.get('registration').token;
		}
		this.agent = axios.create({ baseURL: `http://${weebApi.get('registration').host}/v1/`, headers });
		this.id = shortid.generate();

		this.enabled = true;
	}

	get enabled() {
		return this._enabled;
	}

	async register() {
		if (!this.enabled) {
			return;
		}

		const result = await this.agent.put('/agent/service/register', {
			name: this._weebApi.get('serviceName'),
			id: `${this._weebApi.get('serviceName')}-${this.id}`,
			tags: [this._weebApi.get('env')],
			port: this._weebApi.get('port'),
			checks: this._weebApi.get('registration').checks,
		});

		winston.info(`Registered network service`);

		return result;
	}

	async unregister() {
		if (!this.enabled) {
			return;
		}

		return this.agent.put(`/agent/service/deregister/${this._weebApi.get('serviceName')}-${this.id}`);
	}
}

module.exports = Registrator;
