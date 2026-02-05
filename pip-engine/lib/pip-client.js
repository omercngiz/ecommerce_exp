'use strict';

const net = require('net');
const { OutgoingMessage, REQUEST } = require('./pip-outgoing.js');
const IncomingMessage = require('./pip-incoming.js');

const { fragmentedDataTransfer } = require('../test/data-transfer-tests.js');

const parser = new IncomingMessage();
const socket = net.createConnection({ port: 4000 });

socket.on('connect', () => {
  fragmentedDataTransfer(socket);
});

socket.on('data', (chunk) => {
  const messages = parser.push(chunk);
  messages.forEach(msg => {
    console.log('[client] Server response received\n', msg.payload);
  });
  socket.end();
});
