'use strict'

const { Router } = require('express');
const logger = require('../logger')

const { HTTPCodes, DefaultResponses } = require('../constants')

class BaseRouter {
  constructor() {
    this._router = new Router();
  }

  handleResponse (res, response) {
    if (typeof response === 'number') return res.status(response).json({ status: response, message: DefaultResponses[response] })
    if (!response.status) response.status = HTTPCodes.OK
    if (response.status !== HTTPCodes.OK && !response.message) response.message = DefaultResponses[response.status]
    res.status(response.status).json(response)
  }

  wrapHandler (handler) {
    return async (req, res) => {
      try {
        this.handleResponse(res, await handler(req, res))
      } catch (e) {
        logger.error(e)
        this.handleResponse(res, HTTPCodes.INTERNAL_SERVER_ERROR)
      }
    }
  }

  all (path, handler) {
    return this._router.all(path, this.wrapHandler(handler))
  }

  get (path, handler) {
    return this._router.get(path, this.wrapHandler(handler))
  }

  post (path, handler) {
    return this._router.post(path, this.wrapHandler(handler))
  }

  put (path, handler) {
    return this._router.put(path, this.wrapHandler(handler))
  }

  delete (path, handler) {
    return this._router.delete(path, this.wrapHandler(handler))
  }

  router () {
    return this._router
  }
}

module.exports = BaseRouter
