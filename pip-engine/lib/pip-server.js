'use strict';

const net = require('net');
const IncomingMessage = require('./pip-incoming.js');
const { OutgoingMessage, RESPONSE } = require('./pip-outgoing.js');

const parser = new IncomingMessage();

const server = net.createServer((socket) => {

    /**
     * Handles incoming data on the socket.
     * 
     * @param {Buffer} chunk
     */
    socket.on('data', (chunk) => {
        try {
            const messages = parser.push(chunk);
            messages.forEach(msg => {
                console.log('[server] request:', msg.payload);
                const responsePayload = `Received: ${msg.payload}`;
                const responseFrame = OutgoingMessage(RESPONSE, responsePayload);
                socket.write(responseFrame);
            });
        } catch (error) {
            console.error('[protocol error] ', error.message);
            socket.write(OutgoingMessage(RESPONSE, `ERROR: ${error.message}`));
            socket.destroy();
        }
    });
});

server.listen(4000, () => {
    console.log('Server listening on 4000');
});
