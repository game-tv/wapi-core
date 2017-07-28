'use strict';

const express = require('express');
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
accountApi.listen(12010, 'localhost', () => {
    let app = express();
    app.use(new AccountAPIMiddleware('http://localhost:12010').middleware());
    app.listen(12011, 'localhost', () => {
        // Do request on 12011, see if middleware works
    });
});
