'use strict';

const net = require('net');
const IncomingMessage = require('./pip-incoming.js');
const { OutgoingMessage, RESPONSE } = require('./pip-outgoing.js');

const server = net.createServer((socket) => {
    const parser = new IncomingMessage();

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
                const responsePayload = `[server] I received your message.\n [server] Response to: "${msg.payload}"`;
                const responseFrame = OutgoingMessage(RESPONSE, responsePayload);
                socket.write(responseFrame);
            });
        } catch (error) {
            if(error instanceof Error) {
                console.error('[protocol error] ', error.message);
                socket.write(OutgoingMessage(RESPONSE, `ERROR: ${error.message}`));
                socket.destroy();
            } else {
                throw error;
            }
        }
    });

    socket.on('error', (err) => {
        console.error('[socket error] ', err);
    });

    socket.on('close', () => {
        console.log('[socket] connection closed');
    });

    socket.on('end', () => {
        console.log('[socket] connection ended by client');
    });
});

server.listen(4000, () => {
    console.log('Server listening on 4000');
});
