"use strict";

const { REQUEST, RESPONSE } = require("./frame.js");

/**
 * Decodes a pip frame from a buffer.
 *
 * @param {Buffer} buffer
 * @returns {Object}
 */
function decode(buffer) {
    if (buffer.length < 5) {
        throw new Error("FRAME_TOO_SHORT");
    }
    const length = buffer.readUInt32BE(0);

    if (length > 1024 * 1024) {
        throw new Error("FRAME_TOO_LARGE");
    }
    const type = buffer.readUInt8(4);

    if (type !== REQUEST && type !== RESPONSE) {
        throw new Error("INVALID_FRAME_TYPE");
    }

    if (buffer.length < 5 + length) {
        throw new Error("INCOMPLETE_FRAME");
    }
    const payloadBuffer = buffer.subarray(5, 5 + length);

    let payload;
    try {
        payload = payloadBuffer.toString('utf8');
    } catch (e) {
        throw new Error("INVALID_PAYLOAD_ENCODING");
    }

    return { length: length, type: type, payload: payload };
}

module.exports = { decode };
