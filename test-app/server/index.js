module.exports = function() {
  if (['mirage', 'mirage-test', 'test'].includes(process.env.EMBER_ENV)) {
    return false;
  }
  const express = require('express');
  const app = express();
  const { globSync } = require('glob');
  var mocks = globSync('server/mocks/api/*.js', {cwd: process.cwd()});

  // Log proxy requests
  var morgan  = require('morgan');
  app.use(morgan('dev'));

  app.get('/api/helloworld', function(req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4201');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return res.send({message: 'Hello World!'});
  });

  app.options('/api/*', function(req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4201');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    return res.status(200).end();
  });

  mocks.map(function(cwd, len, fileNames) {
    fileNames.forEach(function(fileName) {
      var route = require('.' + fileName.replace('server', ''));
      route(app);
    })
  });
  console.log('express is running on localhost:3000');
  app.listen(3000);
};
