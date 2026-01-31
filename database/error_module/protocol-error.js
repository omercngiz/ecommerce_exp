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
