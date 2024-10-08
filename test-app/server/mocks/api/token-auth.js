module.exports = function(app) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  const apiTokenAuthRouter = express.Router();

  apiTokenAuthRouter.post('/', function(req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4201');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    if (req.body.username !== 'username' || req.body.password !== 'password') {
      return res.send(401);
    }

    jwt.sign(req.body, 'secret', { expiresIn: '5m' }, function(err, token) {
      if (err) {
        return res.send(500);
      }
      return res.send({
        token: token,
        refresh_token: token,
      });
    });
  });

  app.use(bodyParser.json());
  app.use('/api/token-auth', apiTokenAuthRouter);
};
