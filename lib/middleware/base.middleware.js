'use strict'

const winston = require('winston')

const {HTTPCodes, DefaultResponses} = require('../constants')
const UrlPattern = require('url-pattern')

class BaseMiddleware {
  constructor () {
    this.whitelistArray = []
  }

  getResponse (response) {
    if (typeof response === 'number') return {status: response, message: DefaultResponses[response]}
    if (!response.status) response.status = HTTPCodes.OK
    if (response.status !== HTTPCodes.OK && !response.message) response.message = DefaultResponses[response.status]
    return response
  }

  async exec () {
    return {status: HTTPCodes.INTERNAL_SERVER_ERROR, message: 'Empty middleware'}
  }

  whitelist (path, method) {
    this.whitelistArray.push({pattern: new UrlPattern(path), method: method || 'all'})
  }

  middleware () {
    return async (req, res, next) => {
      try {
        if (req.path) {
          for (let i = 0; i < this.whitelistArray.length; i++) {
            const entry = this.whitelistArray[i]
            if (entry.pattern.match(req.path.toLowerCase()) && (req.method.toLowerCase() === entry.method || entry.method === 'all')) return next()
          }
        }

        const response = this.getResponse(await this.exec(req, res))
        if (response.status === HTTPCodes.OK) return next()
        res.status(response.status)
          .json(response)
      } catch (e) {
        winston.error(e)
        const response = this.getResponse(HTTPCodes.INTERNAL_SERVER_ERROR)
        res.status(response.status)
          .json(response)
      }
    }
  }
}

module.exports = BaseMiddleware
