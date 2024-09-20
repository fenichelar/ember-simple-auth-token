module.exports = function(app) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  const apiTokenRefreshRouter = express.Router();

  apiTokenRefreshRouter.post('/', function(req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4201');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    jwt.verify(req.body.refresh_token, 'secret', function(err, decoded) {
      if (err) {
        return res.status(401).send({
          error: err,
        });
      } else {
        delete decoded.iat;
        delete decoded.exp;
        const token = jwt.sign(decoded, 'secret', { expiresIn: '5m' });
        return res.send({
          token: token,
          refresh_token: token,
        });
      }
    });
  });

  app.use(bodyParser.json());
  app.use('/api/token-refresh', apiTokenRefreshRouter);
};
