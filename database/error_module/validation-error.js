import BaseError from "./base-error.js";

/**
 * ValidationError class for handling validation-related errors.
 * 
 * @extends {BaseError}
 * @property {string} message - Error message.
 * @property {string} code - Specific error code.
 * @property {string} source - The code block or function where the error originated.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export class ValidationError extends BaseError {
    static codes = Object.freeze({
    INVALID_INPUT: "VALIDATION_INVALID_INPUT",
    MISSING_FIELD: "VALIDATION_MISSING_FIELD",
    TYPE_MISMATCH: "VALIDATION_TYPE_MISMATCH",
    OUT_OF_RANGE: "VALIDATION_OUT_OF_RANGE",
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
      layer: "validation",
      source: source,
      severity: BaseError.SEVERITY.WARNING,
      meta,
    });
  }
}
