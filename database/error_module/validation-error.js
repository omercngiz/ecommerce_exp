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
    INVALID_TYPE: "VALIDATION_INVALID_TYPE",
    MISSING_FIELD: "VALIDATION_MISSING_FIELD",
    PATTERN_MISMATCH: "VALIDATION_PATTERN_MISMATCH",
    TYPE_MISMATCH: "VALIDATION_TYPE_MISMATCH",
    OUT_OF_RANGE: "VALIDATION_OUT_OF_RANGE",
    TOO_LONG: "VALIDATION_TOO_LONG",
    TOO_SHORT: "VALIDATION_TOO_SHORT",
    EMPTY_VALUE: "VALIDATION_EMPTY_VALUE",
    NOT_EQUAL: "VALIDATION_NOT_EQUAL",
  });

  /**
   * @typedef {keyof typeof ValidationError.codes} ValidationErrorCode
   * @typedef {typeof BaseError.SEVERITY[keyof typeof BaseError.SEVERITY]} SeverityValue
   */

  /** @type {Readonly<Record<ValidationErrorCode, SeverityValue>>} */
  static severityMap = Object.freeze({
    INVALID_INPUT: BaseError.SEVERITY.ERROR,
    INVALID_TYPE: BaseError.SEVERITY.ERROR,
    MISSING_FIELD: BaseError.SEVERITY.WARNING,
    PATTERN_MISMATCH: BaseError.SEVERITY.ERROR,
    TYPE_MISMATCH: BaseError.SEVERITY.ERROR,
    OUT_OF_RANGE: BaseError.SEVERITY.ERROR,
    TOO_LONG: BaseError.SEVERITY.WARNING,
    TOO_SHORT: BaseError.SEVERITY.WARNING,
    EMPTY_VALUE: BaseError.SEVERITY.WARNING,
    NOT_EQUAL: BaseError.SEVERITY.ERROR,
  });

  /** @type {Readonly<Record<ValidationErrorCode, string>>} */
  static errorMessageMap = Object.freeze({
    INVALID_INPUT: "The input provided is invalid.",
    INVALID_TYPE: "The type of the input is invalid.",
    MISSING_FIELD: "A required field is missing.",
    PATTERN_MISMATCH: "The input does not match the required pattern.",
    TYPE_MISMATCH: "The input type does not match the expected type.",
    OUT_OF_RANGE: "The input value is out of the allowed range.",
    TOO_LONG: "The input value is too long.",
    TOO_SHORT: "The input value is too short.",
    EMPTY_VALUE: "The input value cannot be empty.",
    NOT_EQUAL: "The input values are not equal.",
  });

  /**
   * @param {ValidationErrorCode} code
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
      message: ValidationError.errorMessageMap[code],
      layer: "validation",
      severity: ValidationError.severityMap[code],
    });
  }
}
