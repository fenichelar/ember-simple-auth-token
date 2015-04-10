module.exports = function(app) {
  var express = require('express');
  var jwt = require('jsonwebtoken');
  var usersRouter = express.Router();

  usersRouter.get('/', function(req, res) {
    var token = req.headers.authorization.split('Bearer ')[1];
    var decoded = jwt.verify(token, 'secret');
    res.send(decoded);
  });

  app.use('/api/users', usersRouter);
};
