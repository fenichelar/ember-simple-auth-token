module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var apiTokenRefreshRouter = express.Router();

  apiTokenRefreshRouter.post('/', function(req, res) {
    var decoded = jwt.verify(req.body.token, 'secret');

    res.send({
      token: jwt.sign(decoded, 'secret', {expiresInSeconds: 10})
    });
  });

  app.use(bodyParser.json());
  app.use('/api/api-token-refresh', apiTokenRefreshRouter);
};
