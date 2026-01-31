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
