module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var apiTokenRefreshRouter = express.Router();

  apiTokenRefreshRouter.post('/', function(req, res) {
    jwt.verify(req.body.token, 'secret', function(err, decoded) {
      if (err) {
        res
          .status(401)
          .send({
            error: err
          });
      } else {
        res.send({
          token: jwt.sign(decoded, 'secret', { expiresIn: 10 })
        });
      }
    });
  });

  app.use(bodyParser.json());
  app.use('/api/token-refresh', apiTokenRefreshRouter);
};
