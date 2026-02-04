'use strict';

const net = require('net');
const { decode } = require('./pip-outgoing.js');
const { encode, RESPONSE } = require('./pip-incoming.js');

const server = net.createServer((socket) => {

    /**
     * Handles incoming data on the socket.
     * 
     * @param {Buffer} chunk
     */
  socket.on('data', (chunk) => {
    const message = decode(chunk);

    console.log('[server] received:', message.payload);

    const response = encode(RESPONSE, `ACK: ${message.payload}`);
    socket.write(response);
  });
});

server.listen(4000, () => {
  console.log('Server listening on 4000');
});
