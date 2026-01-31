/**
 * Custom Error Module
 * Defines a custom error class for database operations.
 * @module database/error_module/custom-error
 */

/**
 * Custom BaseError class for database operations.
 * 
 * @typedef {"INFO"|"WARNING"|"ERROR"|"CRITICAL"} Severity
 * 
 * @typedef {Object} BaseErrorParams
 * @property {string} message - Error message.
 * @property {string} code - Error code.
 * @property {string} origin - Module where the error originated.
 * @property {Severity} [severity="ERROR"] - Severity level of the error.
 * @property {Error|null} [cause=null] - Underlying cause of the error.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export default class BaseError extends Error {
  static SEVERITY = Object.freeze({
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    CRITICAL: "CRITICAL",
  });

  /**
   * Creates an instance of BaseError.
   * @param {BaseErrorParams} params - Parameters for the error.
   */
  constructor({
    message,
    code,
    origin,
    severity = BaseError.SEVERITY.ERROR,
    cause = null,
    meta = {},
  }) {
    const normalizedMessage = message ?? "Unknown error";
    super(normalizedMessage);

    this.name = this.constructor.name;
    this.code = code ?? "UNSPECIFIED_ERROR";
    this.origin = origin ?? "UNKNOWN_ORIGIN";
    this.severity = Object.values(BaseError.SEVERITY).includes(severity)
      ? severity
      : BaseError.SEVERITY.ERROR;
    this.meta = meta ?? {};

    if (cause) {
      this.cause = cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
