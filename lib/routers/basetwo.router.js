'use strict';

const winston = require('winston');
const { Router } = require('express');

const { HTTPCodes, DefaultResponses } = require('../constants');

class BaseTwoRouter {
	constructor() {
		this._router = new Router();
		this.init();
	}

	_handleResponse(res, response) {
		// If there is no response set or a response with a socket on it we assume the endpoint responds on its own
		if (response == null || response.socket) return;
		// If it's a number we create a default response for the code
		if (typeof response === 'number') {
			return res.status(response).json({ status: response, message: DefaultResponses[response] });
		}

		// If there is no status set it's probably not a proper formed response so we assume the endpoint responds on its own
		if (!response.status) return;
		// There must be a message when the code is not 200
		if (response.status !== HTTPCodes.OK && !response.message) {
			response.message = DefaultResponses[response.status];
		}

		res.status(response.status).json(response);
	}

	_wrapHandler(handler) {
		return async (req, res) => {
			try {
				this._handleResponse(res, await handler(req, res));
			} catch (e) {
				this.handleError(e, req, res);
			}
		};
	}

	handleError(error, req, res) {
		// Should be overridden by lower class
		winston.error(error);
		this._handleResponse(res, HTTPCodes.INTERNAL_SERVER_ERROR);
	}

	init() {
		// To be overridden by lower class
	}

	all(path, handler) {
		return this._router.all(path, this._wrapHandler(handler));
	}

	get(path, handler) {
		return this._router.get(path, this._wrapHandler(handler));
	}

	post(path, handler) {
		return this._router.post(path, this._wrapHandler(handler));
	}

	put(path, handler) {
		return this._router.put(path, this._wrapHandler(handler));
	}

	delete(path, handler) {
		return this._router.delete(path, this._wrapHandler(handler));
	}

	router() {
		return this._router;
	}
}

module.exports = BaseTwoRouter;
