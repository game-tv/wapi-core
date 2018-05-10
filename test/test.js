'use strict';
/* global describe, it */

describe('wapi-core', () => {
	it('should be requirable', () => {
		require('../src');
	});

	describe('Middleware', () => {
		require('./tests/Middleware');
	});
});
