const { OutgoingMessage, REQUEST } = require('../lib/pip-outgoing.js');

/**
 * Simulates piecemeal data transfer by sending buffer in small chunks.
 * @param {import('net').Socket} socket
 * @param {number} [chunkSize=3] - Size of each chunk in bytes.
 * @param {number} [delay=1000] - Delay between chunks in milliseconds.
 * @param {Function} [callback] - Called when all chunks are sent.
 */
function fragmentedData(socket, chunkSize = 3, delay = 1000, callback) {
    const req = OutgoingMessage(REQUEST, "Hello, Server! This is a fragmented message test.");

    /** @type {Array<Buffer>} */
    const chunks = [];
    
    for (let i = 0; i < req.length; i += chunkSize) {
        chunks.push(req.subarray(i, i + chunkSize));
    }

    let index = 0;

    const interval = setInterval(() => {
        if (index >= chunks.length) {
            clearInterval(interval);
            if (callback) callback();
            return;
        }

        console.log(`[test] sending chunk ${index + 1}/${chunks.length}`);
        socket.write(chunks[index]);
        index++;
    }, delay);

    const cleanup = () => {
        clearInterval(interval);
        if (callback) callback(new Error('Socket closed before transfer completed'));
    };

    socket.once('close', cleanup);
    socket.once('error', cleanup);

    return () => {
        clearInterval(interval);
        socket.removeListener('close', cleanup);
        socket.removeListener('error', cleanup);
    };
}

/**
 * Simulates sending an incomplete header to test server's error handling.
 * @param {import('net').Socket} socket 
 * @param {Function} [callback] - Called after sending the incomplete header.
 */
function incompeleteHeader(socket, callback) {
    const req = OutgoingMessage(REQUEST, "This is an incomplete message test.");
    const incompleteHeader = req.subarray(0, 3); 
    console.log('[test] sending incomplete header');
    socket.write(incompleteHeader);
    if (callback) callback();
}

/**
 * Simulates flooding the server with multiple frames in quick succession.
 * @param {import('net').Socket} socket 
 * @param {number} count 
 */
function frameFlooding(socket, count = 100) {
    for (let i = 0; i < count; i++) {
        socket.write(OutgoingMessage(REQUEST, `${i + 1}`));
    }
}

module.exports = { fragmentedData, incompeleteHeader, frameFlooding };