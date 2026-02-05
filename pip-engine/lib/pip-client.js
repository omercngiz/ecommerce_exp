'use strict';

const net = require('net');
const { encode, REQUEST } = require('./pip-outgoing.js');
const IncomingMessage = require('./pip-incoming.js');

const parser = new IncomingMessage();
const socket = net.createConnection({ port: 4000 });

socket.on('connect', () => {
  const req = encode(REQUEST, "hello server");
  socket.write(req);
});

socket.on('data', (chunk) => {
  const messages = parser.push(chunk);
  messages.forEach(msg => {
    console.log('[client] response:', msg.payload);
  });
  socket.end();
});
