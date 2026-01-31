/**
 * Custom Error Module
 * Defines a custom error class for database operations.
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
 * @property {Severity} [severity=40] - Severity level of the error.
 * @property {Error|null} [cause=null] - Underlying cause of the error.
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
    message,
    code,
    layer,
    source,
    severity = BaseError.SEVERITY.ERROR,
    cause = null,
    meta = {},
  }) {
    if (!message || !code || !layer || !source) {
      throw new TypeError("BaseError requires message, code, layer, and source.");
    }

    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.layer = layer;
    this.source = source;
    this.severity = Object.values(BaseError.SEVERITY).includes(severity)
      ? severity
      : BaseError.SEVERITY.ERROR;
    this.meta = { timestamp: new Date().toISOString(), ...meta };

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
