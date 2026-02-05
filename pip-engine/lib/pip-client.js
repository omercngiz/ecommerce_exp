'use strict';

const net = require('net');
const { OutgoingMessage, REQUEST } = require('./pip-outgoing.js');
const IncomingMessage = require('./pip-incoming.js');

const { piecemealDataTransfer } = require('../test/data-transfer-tests.js');

const parser = new IncomingMessage();
const socket = net.createConnection({ port: 4000 });

socket.on('connect', () => {
  const req = OutgoingMessage(REQUEST, "Hello, Server! This is a fragmented message test.");
  piecemealDataTransfer(socket, req);
});

socket.on('data', (chunk) => {
  const messages = parser.push(chunk);
  messages.forEach(msg => {
    console.log('[client] Server response received\n', msg.payload);
  });
  socket.end();
});
