module.exports = function(app) {
  var express = require('express');
  var jwt = require('jsonwebtoken');
  var usersRouter = express.Router();

  usersRouter.get('/', function(req, res) {
    var authorizationHeader = req.headers.authorization || '';

    var token = authorizationHeader.split('Bearer ')[1];

    if (!token) {
      res.send({}, 200);
      return;
    }

    res.send(jwt.verify(token, 'secret'));
  });

  app.use('/api/users', usersRouter);
};
