module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var apiTokenAuthRouter = express.Router();

  apiTokenAuthRouter.post('/', function(req, res) {
    jwt.sign(req.body, 'secret', { expiresIn: 10 }, function(err, token) {
      if (err) {
        return res.send(500);
      }
      return res.send({
        token: token
      });
    });
  });

  app.use(bodyParser.json());
  app.use('/api/token-auth', apiTokenAuthRouter);
};
