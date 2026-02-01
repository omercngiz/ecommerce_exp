import BaseError from "../base-error.js";

/**
 * ConnectionError class for handling connection-related errors.
 * 
 * @extends {BaseError}
 * @property {string} code - Specific error code.
 * @property {string} source - The code block or function where the error originated.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export default class ConnectionError extends BaseError {
  static codes = Object.freeze({
    SOCKET_TIMEOUT: "CONNECTION_SOCKET_TIMEOUT",
    CONNECTION_REFUSED: "CONNECTION_REFUSED",
    CONNECTION_RESET: "CONNECTION_RESET",
    UNKNOWN_HOST: "CONNECTION_UNKNOWN_HOST",
    MAX_CONNECTION_REACHED: "CONNECTION_MAX_CONNECTION_REACHED",
    NO_RESPONSE_GENERATED: "CONNECTION_NO_RESPONSE_GENERATED",
    SOCKET_ERROR: "CONNECTION_SOCKET_ERROR",

  });

  /**
   * @typedef {keyof typeof ConnectionError.codes} ConnectionErrorCode
   * @typedef {typeof BaseError.SEVERITY[keyof typeof BaseError.SEVERITY]} SeverityValue
   */

  /** @type {Readonly<Record<ConnectionErrorCode, SeverityValue>>} */
  static severityMap = Object.freeze({
    SOCKET_TIMEOUT: BaseError.SEVERITY.WARNING,
    CONNECTION_REFUSED: BaseError.SEVERITY.ERROR,
    CONNECTION_RESET: BaseError.SEVERITY.ERROR,
    UNKNOWN_HOST: BaseError.SEVERITY.CRITICAL,
    MAX_CONNECTION_REACHED: BaseError.SEVERITY.CRITICAL,
    NO_RESPONSE_GENERATED: BaseError.SEVERITY.ERROR,
    SOCKET_ERROR: BaseError.SEVERITY.ERROR,
  });

  /** @type {Readonly<Record<ConnectionErrorCode, string>>} */
  static errorMessageMap = Object.freeze({
    SOCKET_TIMEOUT: "The connection has timed out.",
    CONNECTION_REFUSED: "The connection was refused by the server.",
    CONNECTION_RESET: "The connection was reset.",
    UNKNOWN_HOST: "The specified host is unknown.",
    MAX_CONNECTION_REACHED: "The maximum number of connections has been reached.",
    NO_RESPONSE_GENERATED: "No response was generated from the server.",
    SOCKET_ERROR: "A socket error occurred during the connection.",
  });

  /**
   * @param {ConnectionErrorCode} code
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
      message: ConnectionError.errorMessageMap[code],
      layer: "connection",
      severity: ConnectionError.severityMap[code],
    });
  }
}
