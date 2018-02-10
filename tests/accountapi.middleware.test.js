'use strict'

const BaseTest = require('./base.test')

const express = require('express')
const axios = require('axios')
const AccountAPIMiddleware = require('../lib/middleware/accountapi.middleware')

class AccountAPIMiddlewareTest extends BaseTest {
  constructor () {
    super('Account API Middleware')
  }

  run () {
    const token = 'test_token'
    return new Promise((resolve, reject) => {
      const accountApi = express()
      const apiRouter = express.Router()
      apiRouter.get('/validate/:token', (req, res) => {
        if (req.params.token !== token) return res.status(401).json({ status: 401, message: 'Unauthorized' })
        return res.status(200).json({
          account: {
            name: 'test'
          }
        })
      })
      accountApi.use(apiRouter)
      const apiServer = accountApi.listen(12010, 'localhost', () => {
        const app = express()
        app.use(new AccountAPIMiddleware('http://localhost:12010').middleware())
        app.use('*', (req, res) => res.status(200).json({ status: 200, message: 'Authorized', account: req.account }))
        const server = app.listen(12011, 'localhost', () => {
          axios({
            url: `http://localhost:12011`,
            method: 'get',
            headers: {Authorization: `Bearer ${token}`}
          })
            .then(response => {
              apiServer.close()
              server.close()
              if (response.data && response.data.status === 200 && response.data.message === 'Authorized' && response.data.account) resolve()
              reject(Error('Unexpected response or no account'))
            })
            .catch(e => {
              apiServer.close()
              server.close()
              reject(e)
            })
        })
      })
    })
  }
}

module.exports = AccountAPIMiddlewareTest
