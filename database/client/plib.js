/**
 * Protocol Library - Database Driver
 * JSON Protocol compatible client library
 */

import { generate32BitId } from "../utils.js";

const HEADER_SIZE = 12; // 4 bytes each for messageLength, id/, responseTo

/**
 * Encode a request to send to the database server
 * @param {string} op - Operation (e.g., 'ping', 'get', 'set', 'delete', 'list')
 * @param {string} ns - Namespace (optional)
 * @param {string} key - Key (optional)
 * @param {*} value - Value to store (optional)
 * @returns {Buffer} Encoded message buffer
 */
export const encode = (op, ns = null, key = null, value = null) => {
  // Construct request body according to wire protocol
  const requestBody = {
    op: op,
    payload: {
      ns: ns,
      key: key,
      value: value
    }
  };

  // Convert body to JSON string and then to Buffer
  const bodyString = JSON.stringify(requestBody);
  const bodyBuffer = Buffer.from(bodyString, 'utf-8');

  // Calculate total message length (header + body)
  const messageLength = HEADER_SIZE + bodyBuffer.length;

  // Generate a unique 32-bit request ID
  const requestId = generate32BitId();

  // Create header buffer
  const headerBuffer = Buffer.allocUnsafe(HEADER_SIZE);
  headerBuffer.writeUInt32BE(messageLength, 0);   // messageLength
  headerBuffer.writeUInt32BE(requestId, 4);       // id (request id)
  headerBuffer.writeUInt32BE(0, 8);               // responseTo (0 for client requests)

  // Combine header and body
  return Buffer.concat([headerBuffer, bodyBuffer]);
};

/**
 * Decode a response from the database server
 * @param {Buffer} buffer - Response buffer
 * @returns {Object} Parsed response: {id, responseTo, status, message, value}
 */
export const decode = (buffer) => {
  // Parse header (first 12 bytes)
  const messageLength = buffer.readUInt32BE(0);
  const id = buffer.readUInt32BE(4);              // response id
  const responseTo = buffer.readUInt32BE(8);      // original request id

  // Parse body (remaining bytes)
  const bodyBuffer = buffer.subarray(HEADER_SIZE, messageLength);
  const bodyString = bodyBuffer.toString('utf-8');
  const responseBody = JSON.parse(bodyString);

  // Extract response data according to wire protocol
  return {
    id: id,
    responseTo: responseTo,
    status: responseBody.status,
    message: responseBody.message,
    value: responseBody.payload?.value || null
  };
};
