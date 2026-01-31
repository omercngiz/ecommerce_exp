/**
 * Custom Error Module
 * Defines a custom error class for database operations.
 * 
 * Error flow:
 * Error occurs in a module -> Error instance is created
 * Error instance catched in a higher layer -> error policy called and error formatted
 * Formatted error sent to logging system
 * Formatted error sent to protocol-bridge -> Buffer response created
 * Buffer response sent to tcp-connection -> response sent to client
 * 
 * 
 * @module database/error_module/custom-error
 */

/**
 * Custom BaseError class for database operations.
 * 
 * @typedef {(20|30|40|50)} Severity - Severity levels for errors.
 * 
 * @typedef {Object} BaseErrorParams
 * @property {string} message - Error message.
 * @property {string} code - Error code.
 * @property {string} layer - The module layer where the error originated.
 * @property {string} source - The code block or function where the error originated.
 * @property {Severity} severity=40 - Severity level of the error.
 * @property {Error|null} cause=null - Underlying cause of the error.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export default class BaseError extends Error {
  static SEVERITY = Object.freeze({
    INFO: 20,
    WARNING: 30,
    ERROR: 40,
    CRITICAL: 50,
  });

  /**
   * Creates an instance of BaseError.
   * @param {BaseErrorParams} params - Parameters for the error.
   */
  constructor({
    code,
    source,
    cause = null,
    meta = {},
    message,
    layer,
    severity = BaseError.SEVERITY.ERROR,
  }) {
    if (!message || !code || !layer || !source) {
      console.warn("Invalid BaseError construction", arguments);
    }

    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.layer = layer;
    this.source = source;
    this.severity = Object.values(BaseError.SEVERITY).includes(severity)
      ? severity
      : BaseError.SEVERITY.ERROR;
    this.timestamp = new Date().toISOString();
    this.meta = meta;

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
