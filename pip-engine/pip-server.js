'use strict';

const net = require('net');
const { decode } = require('./pip-incoming.js');
const { encode, RESPONSE } = require('./pip-outgoing.js');

const server = net.createServer((socket) => {

    /**
     * Handles incoming data on the socket.
     * 
     * @param {Buffer} chunk
     */
    socket.on('data', (chunk) => {
        try {
            const request = decode(chunk);

            console.log('[server] received:', request.payload);

            const response = encode(RESPONSE, `ACK: ${request.payload}\nHello client`);
            socket.write(response);
        } catch (error) {
            console.error('[protocol error] ', error.message);
            socket.write(`ERROR: ${error.message}`);
            socket.destroy();
        }
    });
});

server.listen(4000, () => {
    console.log('Server listening on 4000');
});
