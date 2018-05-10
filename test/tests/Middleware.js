'use strict';
/* global it */

const assert = require('assert');

const { Middleware } = require('../../src');

let middleware = null;

it('should initialize', () => {
	middleware = new Middleware('MochaTest');
});

it('should return "MochaTest" as a name', () => {
	assert.equal('MochaTest', middleware.name);
});

it('should register on an express app and be callable', () => {
	const app = {
		use: m => {
			m({}, {}, () => {});
		},
	};

	middleware.register(app);
});

it('should return 200 when exec is called', async () => {
	const result = await middleware.exec();
	assert.equal(200, result);
});
