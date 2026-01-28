/**
 * @fileoverview
 * 
 * Simple Protocol Operator
 * 
 * Simple Wire Protocol is a simple socket-based, request-response 
 * style protocol. Clients communicate with the database server through 
 * a regular TCP/IP socket.
 * 
 * Implements a binary wire protocol for database
 * operations with the following structure:
 * ___________________________________________________
 * |                       Header                    |
 * ---------------------------------------------------
 * |      4 bytes    |    4 bytes   |     4 bytes    |
 * |  messageLength  |      id      |   responseTo   |
 * ---------------------------------------------------
 * 
 * ________________________________________________________________________________
 * |                                     Request Body                             |
 * --------------------------------------------------------------------------------
 * |           Operation            |                    Payload                  |
 * |                                |----------------------------------------------
 * |  CREATE, READ, UPDATE, DELETE  |      Namespace      |   Key   |    Value    |
 * --------------------------------------------------------------------------------
 * 
 * ________________________________________________________________________________
 * |                                     Response Body                            |
 * --------------------------------------------------------------------------------
 * |           Status Code          |       Message       |       Payload         |
 * |                                |     Status Code     |------------------------
 * |100:continue 200:ok 201:created |       message       |        Value          |
 * --------------------------------------------------------------------------------
 * 
 * @module simple-protocol
 */

import { StatusMessages } from "../protocol/constants.js";
import { generate32BitId } from "../utils/utils.js";
import EnvConfig from "../env-config.js";

/**
 * Simple Protocol Class
 * 
 * Encodes and decodes messages according to the Simple Wire Protocol.
 * 
 * @class SimpleProtocol
 */
export default class SimpleProtocol {
  HEADER_SIZE = EnvConfig.get_header_size();
  MIN_MESSAGE_LENGTH = EnvConfig.get_min_message_length();
  MAX_MESSAGE_LENGTH = EnvConfig.get_max_message_length();

  /**
   * Encode a response message into binary format
   * @param {number} reqID 
   * @param {Object|null} response 
   * @param {number} statusCode 
   * @returns {Buffer}
   */
  encode = (reqID, response, statusCode) => {
    try {
      // Validate parameters
      if (!Number.isInteger(reqID) || reqID < 0 || reqID > 0xFFFFFFFF) {
        throw new TypeError(`Invalid reqID: must be a 32-bit unsigned integer, got ${reqID}`);
      }

      if (typeof statusCode !== 'number') {
        throw new TypeError(`Invalid statusCode: must be a number, got ${typeof statusCode}`);
      }

      // Construct response body according to wire protocol
      const responseBody = {
        status: statusCode,
        message: StatusMessages[statusCode] || 'Unknown Status',
        payload: {
          value: response
        }
      };

      // Convert body to JSON string and then to Buffer
      let bodyString;
      try {
        bodyString = JSON.stringify(responseBody);
      } catch (error) {
        throw new Error(`Failed to serialize response to JSON: ${error.message}`);
      }

      const bodyBuffer = Buffer.from(bodyString, 'utf-8');

      // Calculate total message length (header + body)
      const messageLength = this.HEADER_SIZE + bodyBuffer.length;

      // Validate message length
      if (messageLength > this.MAX_MESSAGE_LENGTH) {
        throw new RangeError(
          `Message size ${messageLength} exceeds maximum allowed size ${this.MAX_MESSAGE_LENGTH}`
        );
      }

      // Generate a unique 32-bit response ID
      const resID = generate32BitId();

      // Create header buffer
      const headerBuffer = Buffer.allocUnsafe(this.HEADER_SIZE);
      headerBuffer.writeUInt32BE(messageLength, 0);   // messageLength
      headerBuffer.writeUInt32BE(resID, 4);           // id (response id)
      headerBuffer.writeUInt32BE(reqID, 8);           // responseTo (original request id)

      // Combine header and body
      return Buffer.concat([headerBuffer, bodyBuffer]);
    } catch (error) {
      // Re-throw with additional context
      if (error instanceof TypeError || error instanceof RangeError) {
        throw error;
      }
      throw new Error(`Failed to encode message: ${error.message}`);
    }
  };

  /**
   * Decode a request message from binary format
   * 
   * @param {Buffer} buffer - The binary message buffer to decode
   * @returns {Array<Object|number>} Tuple of [requestID, operation, namespace, key, data]
   *   - requestID {number}: The unique request identifier
   *   - operation {string}: The database operation (e.g., 'ping', 'get', 'set')
   *   - namespace {string|null}: The namespace for the operation
   *   - key {string|null}: The key for the operation
   *   - data {*}: The data payload for the operation
   * @throws {TypeError} If buffer is not a Buffer instance
   * @throws {RangeError} If buffer is too small or messageLength is invalid
   * @throws {Error} If JSON parsing fails or message format is invalid
   */
  decode = (buffer) => {
    try {
      // Validate input
      if (!Buffer.isBuffer(buffer)) {
        throw new TypeError(`Expected Buffer, got ${typeof buffer}`);
      }

      if (buffer.length < this.HEADER_SIZE) {
        throw new RangeError(
          `Buffer too small: expected at least ${this.HEADER_SIZE} bytes, got ${buffer.length}`
        );
      }

      // Parse header (first 12 bytes)
      const messageLength = buffer.readUInt32BE(0);
      const id = buffer.readUInt32BE(4);
      const responseTo = buffer.readUInt32BE(8);

      // Validate message length
      if (messageLength < this.MIN_MESSAGE_LENGTH) {
        throw new RangeError(
          `Invalid messageLength: ${messageLength}, must be at least ${this.MIN_MESSAGE_LENGTH}`
        );
      }

      if (messageLength > this.MAX_MESSAGE_LENGTH) {
        throw new RangeError(
          `Message length ${messageLength} exceeds maximum ${this.MAX_MESSAGE_LENGTH}`
        );
      }

      if (messageLength > buffer.length) {
        throw new RangeError(
          `Incomplete message: expected ${messageLength} bytes, got ${buffer.length}`
        );
      }

      // Parse body (remaining bytes)
      const bodyBuffer = buffer.subarray(this.HEADER_SIZE, messageLength);
      
      if (bodyBuffer.length === 0) {
        throw new Error('Empty message body');
      }

      let bodyString;
      try {
        bodyString = bodyBuffer.toString('utf-8');
      } catch (error) {
        throw new Error(`Failed to decode buffer as UTF-8: ${error.message}`);
      }

      let requestBody;
      try {
        requestBody = JSON.parse(bodyString);
      } catch (error) {
        throw new Error(`Failed to parse JSON body: ${error.message}`);
      }

      // Validate request structure
      if (!requestBody || typeof requestBody !== 'object') {
        throw new Error('Invalid request body: expected object');
      }

      if (typeof requestBody.op !== 'string') {
        throw new Error('Invalid request body: missing or invalid "op" field');
      }

      // Extract request data according to wire protocol
      const op = requestBody.op;
      const ns = requestBody.payload?.ns || null;
      const key = requestBody.payload?.key || null;
      const data = requestBody.payload?.value || null;

      // Return: [request ID, operation, namespace, key, data]
      return [id, op, ns, key, data];
    } catch (error) {
      // Re-throw with additional context
      if (error instanceof TypeError || error instanceof RangeError) {
        throw error;
      }
      throw new Error(`Failed to decode message: ${error.message}`);
    }
  };
}
