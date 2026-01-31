import BaseError from "./base-error.js";

/**
 * ProtocolError class for handling protocol-related errors.
 * 
 * @extends {BaseError}
 * @property {string} message - Error message.
 * @property {string} code - Specific error code.
 * @property {string} source - The code block or function where the error originated.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export class ProtocolError extends BaseError {
    static codes = Object.freeze({
    INVALID_FORMAT: "PROTOCOL_INVALID_FORMAT",
    UNSUPPORTED_VERSION: "PROTOCOL_UNSUPPORTED_VERSION",
    DISTORTED_HEADER: "PROTOCOL_DISTORTED_HEADER",
    SERIALIZATION_FAILURE: "PROTOCOL_SERIALIZATION_FAILURE",
    ENCODING_ERROR: "PROTOCOL_ENCODING_ERROR",
    DECODING_ERROR: "PROTOCOL_DECODING_ERROR",
  });

  /**
   * @param {string} message
   * @param {string} code
   * @param {string} source
   * @param {Object} [meta={}]
   */
  constructor(message, code, source, meta = {}) {
    super({
      message,
      code: code,
      layer: "protocol",
      source: source,
      severity: BaseError.SEVERITY.WARNING,
      meta,
    });
  }
}
