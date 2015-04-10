module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var apiTokenAuthRouter = express.Router();

  apiTokenAuthRouter.post('/', function(req, res) {
    var token = jwt.sign(req.body, 'secret', {expiresInSeconds: 10});
    res.send({
      token: token
    });
  });

  app.use(bodyParser.json());
  app.use('/api/api-token-auth', apiTokenAuthRouter);
};
