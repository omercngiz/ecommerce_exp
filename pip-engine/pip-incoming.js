'use strict';

/**
 * Decodes a pip frame from a buffer.
 * 
 * @param {Buffer} buffer 
 * @returns {Object}
 */
function decode(buffer) {
  const length = buffer.readUInt32BE(0);
  const type = buffer.readUInt8(4);
  const payload = buffer.subarray(5, 5 + length).toString();

  return { "length": length, "type": type, "payload": payload };
}

module.exports = { decode };
