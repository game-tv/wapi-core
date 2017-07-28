'use strict';

const router = require('express').Router();
const winston = require('winston');

const { HTTPCodes, DefaultResponses } = require('../utils/constants');

class BaseRouter {
    handleResponse(res, response) {
        if (typeof response === 'number') return res.status(response).json({ status: response, message: DefaultResponses[response] });
        if (!response.status) response.status = HTTPCodes.OK;
        if (response.status !== HTTPCodes.OK && !response.message) response.message = DefaultResponses[response.status];
        res.status(response.status).json(response);
    }

    wrapHandler(handler) {
        return async(req, res) => {
            try {
                this.handleResponse(res, await handler(req, res));
            } catch (e) {
                winston.error(e);
                this.handleResponse(res, HTTPCodes.INTERNAL_SERVER_ERROR);
            }
        };
    }

    all(path, handler) {
        return router.all(path, this.wrapHandler(handler));
    }

    get(path, handler) {
        return router.get(path, this.wrapHandler(handler));
    }

    post(path, handler) {
        return router.post(path, this.wrapHandler(handler));
    }

    put(path, handler) {
        return router.put(path, this.wrapHandler(handler));
    }

    delete(path, handler) {
        return router.delete(path, this.wrapHandler(handler));
    }

    router() {
        return router;
    }
}

module.exports = BaseRouter;
