'use strict';

const url = require('url');
const winston = require('winston');

let redis;
try {
	const tempRedis = require('redis');
	const { promisifyAll } = require('tsubaki');
	tempRedis.RedisClient.prototype = promisifyAll(tempRedis.RedisClient.prototype);
	tempRedis.Multi.prototype = promisifyAll(tempRedis.Multi.prototype);
	redis = tempRedis;
} catch (e) {
	// Ignore
}

class Redis {
	/**
	 * Creates a new Redis
	 *
	 * @param {string} redisUrl A URL like redis://[password@]hostname[:port][/prefix]
	 */
	constructor(redisUrl) {
		if (!redis) {
			throw new Error('Redis and/or Tsubaki is not installed');
		}

		const parsed = url.parse(redisUrl);

		this.host = parsed.hostname || '127.0.0.1';
		this.port = parsed.port || 6379;
		this.pass = parsed.auth || null;
		this.prefix = parsed.path ? parsed.path.replace(/^\//, '') : null;

		this._connected = false;

		const opts = {
			host: this.host,
			port: this.port,
			password: this.pass,
			prefix: this.prefix,
		};

		winston.info(`Connecting to Redis on ${this.host}:${this.port}...`);
		this._conn = redis.createClient(opts);

		this._registerEvents();
	}

	_registerEvents() {
		this._conn.on('ready', () => {
			this._connected = true;
			winston.info(`Redis ready on ${this.host}:${this.port}`);
		});
		this._conn.on('error', e => {
			this._connected = false;
			winston.error(`Failed to connect to Redis on ${this.host}:${this.port}: ${e.message}`);
		});
		this._conn.on('reconnecting', o => {
			this._connected = false;
			winston.info(`Reconnecting to Redis on ${this.host}:${this.port} (Attempt #${o.attempt}, Delay: ${o.delay}ms)...`);
		});
		this._conn.on('end', () => {
			this._connected = false;
			winston.warn(`Redis connection to ${this.host}:${this.port} was closed`);
		});
	}

	multi() {
		return this._conn.multi();
	}

	async get(key) {
		return this._conn.getAsync(key);
	}

	async set(key, value) {
		return this._conn.setAsync(key, value);
	}

	async getex(key, seconds) {
		const multi = this.multi();

		multi.get(key);
		multi.expire(key, seconds);

		const result = await multi.execAsync();
		if (!result || !result[0]) {
			return null;
		}

		return result[0];
	}

	async setex(key, seconds, value) {
		return this._conn.setexAsync(key, seconds, value);
	}

	async mget(keys, mapData = false) {
		if (!Array.isArray(keys)) {
			throw new Error('Redis mget keys was not an array');
		}

		if (!mapData) {
			return this._conn.mgetAsync(keys);
		}

		const results = await this._conn.mgetAsync(keys);
		const map = {};
		for (let i = 0; i < keys.length; i++) {
			map[keys[i]] = results[i];
		}
		return map;
	}

	get connected() {
		return this._connected;
	}

	static hasRedis() {
		return redis != null;
	}
}

module.exports = Redis;
