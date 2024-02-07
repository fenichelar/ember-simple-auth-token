import { fastify } from 'fastify';
import jwt from 'jsonwebtoken';
import cors from '@fastify/cors';

const app = fastify();

await app.register(cors, {
  // put your options here
})

app.get('/api/users/', async (request, reply) => {
  const authorizationHeader = request.headers.authorization || '';
  const token = authorizationHeader.split('Bearer ')[1];

  if (!token) {
    return reply.send({}, 200);
  }

  const user = jwt.verify(token, 'secret');

  return reply.send({username: user.username});
});

app.post('/api/token-auth/', async (request, reply) => {
  const token = jwt.sign(request.body, 'secret',  { expiresIn: 10 });
  return reply.send({token});
});

app.post('/api/token-refresh/', async (request, reply) => {
  const decoded = jwt.verify(req.body.token, 'secret');
  delete decoded.iat;
  delete decoded.exp;
  return reply.send({
    token: jwt.sign(decoded, 'secret', { expiresIn: 10 })
  });
});

app.listen({
  port: 3000,
}, (err, address) => {
  if (err) throw err;
  console.log(`server listening on ${address}`);
});
