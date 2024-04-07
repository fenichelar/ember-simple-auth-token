import { createServer, Response } from 'miragejs';
import { sign, verify } from 'jsonwebtoken';

const secret = '0123456789';
const issuer = 'Ember Simple Auth Token';
const audience = 'Developers';
const algorithm = 'HS512';
const expiration = '5m';
const notBefore = 0;

const payload = {
  userAccount: {
    id: '7a887474-26bb-43ec-a063-6b8c6aba727e',
    firstName: 'test',
    lastName: 'user'
  }
};

const options = {
  expiresIn: expiration,
  notBefore: notBefore,
  issuer: issuer,
  audience: audience,
  subject: '127.0.0.1',
  algorithm: algorithm,
};

export default function (config) {
  const finalConfig = {
    ...config,
    // uncomment to opt into ember-cli-mirage to auto discover ember serializers
    // serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  this.urlPrefix = 'http://localhost:8080';
  /* Note: these only affect routes defined *after* them! */

  this.namespace = '/api';
  this.timing = 0;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    https://miragejs.com/docs/getting-started/overview/
  */

  this.get('/helloworld', function() {
    return {message: 'Hello World!'};
  });

  this.post('/token-auth', function(schema, request) {
    let body = JSON.parse(request.requestBody);
    if (body.username === 'admin' && body.password === 'abc123') {
      let token = sign(payload, secret, options);
      return {
        token: token,
        refresh_token: token
      };
    } else {
      return new Response(401, {}, {errors: [{status: 401, message: 'Incorrect email or password'}]});
    }
  });

  this.post('/token-refresh', function(schema, request) {
    return verify(JSON.parse(request.requestBody).refresh_token, secret, function(err, decoded) {
      if (err) {
        return new Response(401, {}, {errors: [{status: 401, message: 'Incorrect email or password'}]});
      } else {
        delete decoded.iat;
        delete decoded.exp;
        let token = sign(decoded, secret, options);
        return {
          token: token,
          refresh_token: token
        };
      }
    });
  });

  this.post('/endpoint', function() {
    return {response: 'true'}
  });
}
