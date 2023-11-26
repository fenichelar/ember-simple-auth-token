module.exports = function (app) {
  var express = require('express');
  var jwt = require('jsonwebtoken');
  var usersRouter = express.Router();

  usersRouter.get('/', function (req, res) {
    var authorizationHeader = req.headers.authorization || '';
    var token = authorizationHeader.split('Bearer ')[1];

    if (!token) {
      return res.send({}, 200);
    }
    var user = jwt.verify(token, 'secret');

    return res.send({ username: user.username });
  });

  app.use('/api/users', usersRouter);
};
