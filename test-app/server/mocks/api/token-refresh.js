module.exports = function(app) {
  var express = require('express');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var apiTokenRefreshRouter = express.Router();

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
        var token = jwt.sign(decoded, 'secret', { expiresIn: '5m' });
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
