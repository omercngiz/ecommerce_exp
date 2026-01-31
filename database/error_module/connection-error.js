import BaseError from "./base-error.js";

/**
 * ConnectionError class for handling connection-related errors.
 * 
 * @extends {BaseError}
 * @property {string} message - Error message.
 * @property {string} code - Specific error code.
 * @property {string} source - The code block or function where the error originated.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export class ConnectionError extends BaseError {
  static codes = Object.freeze({
    SOCKET_TIMEOUT: "CONNECTION_SOCKET_TIMEOUT",
    REFUSED: "CONNECTION_REFUSED",
    RESET: "CONNECTION_RESET",
    UNKNOWN_HOST: "CONNECTION_UNKNOWN_HOST",
    MAX_CONNECTION_REACHED: "CONNECTION_MAX_CONNECTION_REACHED",
    NO_RESPONSE_GENERATED: "CONNECTION_NO_RESPONSE_GENERATED",
    SOCKET_ERROR: "CONNECTION_SOCKET_ERROR",

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
      layer: "connection",
      source: source,
      severity: BaseError.SEVERITY.WARNING,
      meta,
    });
  }
}
