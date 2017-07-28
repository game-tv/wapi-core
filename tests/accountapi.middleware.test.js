'use strict';

const express = require('express');
const superagent = require('superagent');
const AccountAPIMiddleware = require('../lib/middleware/accountapi.middleware');

const token = 'test_token';

let accountApi = express();
let apiRouter = express.Router();
apiRouter.get('/validate/:token', (req, res) => {
    if (req.params.token !== token) return res.status(401).json({ status: 401, message: 'Unauthorized' });
    return res.status(200).json({
        account: {
            name: 'test',
        },
    });
});
accountApi.use(apiRouter);
let apiServer = accountApi.listen(12010, 'localhost', () => {
    let app = express();
    app.use(new AccountAPIMiddleware('http://localhost:12010').middleware());
    app.use('*', (req, res) => res.status(200).json({ status: 200, message: 'Authorized', account: req.account }));
    let server = app.listen(12011, 'localhost', () => {
        superagent
        .get(`http://localhost:12011`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .then(response => {
            console.log(response.body);
            apiServer.close();
            server.close();
        })
        .catch(e => {
            console.log(e);
            apiServer.close();
            server.close();
        });
    });
});
