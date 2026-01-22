import { StatusMessages } from "./constants.js";
import { generate32BitId } from "./utils.js";

/**
 * JSON Protocol Handler
 * 
 * Implements a binary wire protocol for database operations with the following structure:
 * 
 * Header (12 bytes):
 * - messageLength (4 bytes): Total message size including header
 * - id (4 bytes): Unique message identifier
 * - responseTo (4 bytes): ID of the message being responded to (0 for requests)
 * 
 * Body (variable length):
 * - JSON-encoded payload with operation details
 * 
 * @class JSONProtocol
 */
export default class JSONProtocol {
  /**
   * Encode a response message into binary format
   * 
   * @param {number} reqID - The request ID this response is for
   * @param {*} response - The response data to send
   * @param {number} statusCode - HTTP-like status code (200, 404, 500, etc.)
   * @returns {Buffer} Binary encoded response message
   * @throws {TypeError} If reqID is not a valid 32-bit unsigned integer
   * @throws {TypeError} If statusCode is not a number
   * @throws {Error} If response cannot be serialized to JSON
   * @throws {RangeError} If encoded message exceeds MAX_MESSAGE_LENGTH
   */

  /** Header size in bytes: 4 bytes each for messageLength, id, responseTo */
  HEADER_SIZE = 12;

  /** Minimum valid message length (header only) */
  MIN_MESSAGE_LENGTH = this.HEADER_SIZE;

  /** Maximum reasonable message length (10MB) to prevent memory attacks */
  MAX_MESSAGE_LENGTH = 10 * 1024 * 1024;

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
   * @returns {Array} Tuple of [requestID, operation, namespace, key, data]
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
