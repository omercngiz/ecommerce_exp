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
   * @typedef {keyof typeof ProtocolError.codes} ProtocolErrorCode
   * @typedef {typeof BaseError.SEVERITY[keyof typeof BaseError.SEVERITY]} SeverityValue
   */

  /** @type {Readonly<Record<ProtocolErrorCode, SeverityValue>>} */
  static severityMap = Object.freeze({
    INVALID_FORMAT: BaseError.SEVERITY.ERROR,
    UNSUPPORTED_VERSION: BaseError.SEVERITY.CRITICAL,
    DISTORTED_HEADER: BaseError.SEVERITY.ERROR,
    SERIALIZATION_FAILURE: BaseError.SEVERITY.ERROR,
    ENCODING_ERROR: BaseError.SEVERITY.ERROR,
    DECODING_ERROR: BaseError.SEVERITY.ERROR,
  });

  /** @type {Readonly<Record<ProtocolErrorCode, string>>} */
  static errorMessageMap = Object.freeze({
    INVALID_FORMAT: "The protocol format is invalid.",
    UNSUPPORTED_VERSION: "The protocol version is unsupported.",
    DISTORTED_HEADER: "The protocol header is distorted.",
    SERIALIZATION_FAILURE: "Failed to serialize the data.",
    ENCODING_ERROR: "An error occurred during encoding.",
    DECODING_ERROR: "An error occurred during decoding.",
  });

  /**
   * @param {ProtocolErrorCode} code
   * @param {string} source
   * @param {Error|null} cause
   * @param {Object} [meta={}]
   */
  constructor(code, source, cause, meta = {}) {
    super({
      code: code,
      source: source,
      cause: cause,
      meta: meta,
      message: ProtocolError.errorMessageMap[code],
      layer: "protocol",
      severity: ProtocolError.severityMap[code],
    });
  }
}
