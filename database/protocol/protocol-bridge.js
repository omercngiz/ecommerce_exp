/**
 * @fileoverview
 *
 * Protocol Bridge Module
 *
 * Responsibilities:
 *  - Get incoming TCP data streams as raw Buffer objects.
 *  - Parse incoming data according to the JSON wire protocol.
 *  - Buffer incomplete data to correctly handle partial messages.
 *  - Decode and process requests using the Database module.
 *  - Return encoded responses according to the JSON wire protocol.
 *
 * @module protocol-bridge
 */

import SimpleProtocol from "./simple-protocol.js";
import { handle } from "../engine/database-api.js";
import { StatusCodes, StatusMessages } from "./protocol-constants.js";
import { log } from "../utils/logger.js";
import EnvConfig from "../env-config.js";

const protocol = new SimpleProtocol();
const MAX_PAYLOAD_SIZE = EnvConfig.get_max_payload_size();

let accBuffer = Buffer.alloc(0);
  
/**
 * Protocol Bridge Class
 * 
 * Handles parsing, decoding, processing, and encoding of TCP data.
 */
export default class ProtocolBridge {
  /**
   * Parses incoming data according to the JSON wire protocol,
   * buffering incomplete data to correctly handle partial messages,
   * decodes and processes the request and returns the encoded response.
   *
   * @param {Buffer} chunk
   * @returns {Promise<Buffer|void>} Encoded response buffer
   * @throws {Error} If decoding or processing fails
   */
   handleRequest = async (chunk) => {
    if (chunk.length > MAX_PAYLOAD_SIZE) {
      log("ERROR", "Payload size exceeds limit", { size: chunk.length });
      return protocol.encode(0, null, StatusCodes.CONTENT_TOO_LARGE);
    }

    accBuffer = Buffer.concat([accBuffer, chunk]);

    while (true) {
      if (accBuffer.length < protocol.HEADER_SIZE) {
        break;
      }

      const messageLength = accBuffer.readUInt32BE(0);

      if (accBuffer.length < messageLength) {
        break;
      }

      const fullMessage = accBuffer.subarray(0, messageLength);
      accBuffer = accBuffer.subarray(messageLength, accBuffer.length);

      try {
        const [reqID, op, ns, key, data] = protocol.decode(fullMessage);
        const [value, statusCode] = await handle(op, ns, key, data);
        const response = protocol.encode(reqID, value, statusCode);
        return response;
      } catch (error) {
        log("ERROR", "Request handling error", { error });
        const errorResponse = protocol.encode(
          0,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
        return errorResponse;
      }
    }
  };

  /**
   * Encodes a socket error message into the protocol format.
   *
   * @param {string} message - Error message to encode
   * @returns {Buffer} Encoded error response buffer
   */
  handleSocketError = (message) => {
    return protocol.encode(0, {message}, StatusCodes.SOCKET_ERROR);
  };

  // todo: handleSocketError will be replaced with errorDespatcher() in the future
}

