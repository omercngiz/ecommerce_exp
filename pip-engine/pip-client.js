'use strict';

const net = require('net');
const { encode, REQUEST } = require('./pip-incoming.js');
const { decode } = require('./pip-outgoing.js');

const socket = net.createConnection({ port: 4000 });

socket.on('connect', () => {
  const req = encode(REQUEST, 'hello server');
  socket.write(req);
});

socket.on('data', (chunk) => {
  const res = decode(chunk);
  console.log('[client] response:', res.payload);
  socket.end();
});
