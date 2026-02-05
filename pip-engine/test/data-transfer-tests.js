/**
 * Simulates piecemeal data transfer by sending buffer in small chunks
 * @param {import('net').Socket} socket - Socket to emit data to
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

module.exports = { piecemealDataTransfer };