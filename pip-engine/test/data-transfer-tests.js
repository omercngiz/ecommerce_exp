/**
 * Simulates piecemeal data transfer by sending buffer in small chunks
 * @param {import('events').EventEmitter} socket - Socket to emit data to
 * @param {Buffer} buffer - Buffer to split and send
 * @param {number} [chunkSize=3] - Size of each chunk in bytes
 * @param {number} [delay=1000] - Delay between chunks in milliseconds
 * @param {Function} [callback] - Called when all chunks are sent
 */
function piecemealDataTransfer(socket, buffer, chunkSize = 3, delay = 1000, callback) {
    /** @type {Array<Buffer>} */
    const chunks = [];
    
    for (let i = 0; i < buffer.length; i += chunkSize) {
        chunks.push(buffer.subarray(i, i + chunkSize));
    }

    let index = 0;

    const interval = setInterval(() => {
        // All chunks sent
        if (index >= chunks.length) {
            clearInterval(interval);
            if (callback) callback();
            return;
        }

        socket.emit('data', chunks[index]);
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