'use strict';

const { REQUEST, RESPONSE } = require('./frame.js');

/**
 * Encodes a message with a type and payload into a Buffer.
 * 
 * @param {number} type 
 * @param {string} payload 
 * @returns {Buffer}
 */
function encode(type, payload) {
    if (type !== REQUEST && type !== RESPONSE) {
        throw new Error("INVALID_FRAME_TYPE");
    }

    if (typeof payload !== 'string') {
        throw new Error("PAYLOAD_MUST_BE_STRING");
    }

    const data = Buffer.from(payload, 'utf8');
    const buffer = Buffer.alloc(5 + data.length);

    buffer.writeUInt32BE(data.length, 0);
    buffer.writeUInt8(type, 4);
    data.copy(buffer, 5);

    return buffer;
}

module.exports = { encode, REQUEST, RESPONSE };