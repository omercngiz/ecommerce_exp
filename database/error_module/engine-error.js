import BaseError from "./base-error.js";

/**
 * EngineError class for handling engine-related errors.
 * 
 * @extends {BaseError}
 * @property {string} message - Error message.
 * @property {string} code - Specific error code.
 * @property {string} source - The code block or function where the error originated.
 * @property {Object} [meta={}] - Additional metadata related to the error.
 */
export class EngineError extends BaseError {
    static codes = Object.freeze({
        UNKNOWN_OPERATION: 'ENGINE_UNKNOWN_OPERATION',
        INVALID_NAMESPACE: 'ENGINE_INVALID_NAMESPACE',
        INVALID_KEY: 'ENGINE_INVALID_KEY',
        INVALID_DATA_FORMAT: 'ENGINE_INVALID_DATA_FORMAT',
        ID_OVERRIDE_ATTEMPT: 'ENGINE_ID_OVERRIDE_ATTEMPT',
        RECORD_NOT_FOUND: 'ENGINE_RECORD_NOT_FOUND',
        REPO_CREATION_FAILED: 'ENGINE_REPO_CREATION_FAILED',
        REPO_ACCESS_FAILED: 'ENGINE_REPO_ACCESS_FAILED',
        FILE_NOT_FOUND: 'ENGINE_FILE_NOT_FOUND',
        FILE_READ_ERROR: 'ENGINE_FILE_READ_ERROR',
        FILE_WRITE_ERROR: 'ENGINE_FILE_WRITE_ERROR',
        FILE_DELETE_ERROR: 'ENGINE_FILE_DELETE_ERROR',
        FILE_SIZE_EXCEEDED: 'ENGINE_FILE_SIZE_EXCEEDED',
        READ_PERMISSION_DENIED: 'ENGINE_READ_PERMISSION_DENIED',
        WRITE_PERMISSION_DENIED: 'ENGINE_WRITE_PERMISSION_DENIED',
        NOT_ENOUGH_DISK_SPACE: 'ENGINE_NOT_ENOUGH_DISK_SPACE',
        INVALID_JSON_IN_FILE: 'ENGINE_INVALID_JSON_IN_FILE',
    });

    /**
     * @typedef {keyof typeof EngineError.codes} EngineErrorCode
     * @typedef {typeof BaseError.SEVERITY[keyof typeof BaseError.SEVERITY]} SeverityValue
     */

    /** @type {Readonly<Record<EngineErrorCode, SeverityValue>>} */
    static severityMap = Object.freeze({
        UNKNOWN_OPERATION: BaseError.SEVERITY.ERROR,
        INVALID_NAMESPACE: BaseError.SEVERITY.WARNING,
        INVALID_KEY: BaseError.SEVERITY.WARNING,
        INVALID_DATA_FORMAT: BaseError.SEVERITY.ERROR,
        ID_OVERRIDE_ATTEMPT: BaseError.SEVERITY.CRITICAL,
        RECORD_NOT_FOUND: BaseError.SEVERITY.INFO,
        REPO_CREATION_FAILED: BaseError.SEVERITY.CRITICAL,
        REPO_ACCESS_FAILED: BaseError.SEVERITY.CRITICAL,
        FILE_NOT_FOUND: BaseError.SEVERITY.INFO,
        FILE_READ_ERROR: BaseError.SEVERITY.ERROR,
        FILE_WRITE_ERROR: BaseError.SEVERITY.ERROR,
        FILE_DELETE_ERROR: BaseError.SEVERITY.ERROR,
        FILE_SIZE_EXCEEDED: BaseError.SEVERITY.WARNING,
        READ_PERMISSION_DENIED: BaseError.SEVERITY.CRITICAL,
        WRITE_PERMISSION_DENIED: BaseError.SEVERITY.CRITICAL,
        NOT_ENOUGH_DISK_SPACE: BaseError.SEVERITY.CRITICAL,
        INVALID_JSON_IN_FILE: BaseError.SEVERITY.ERROR,
    });

    /** @type {Readonly<Record<EngineErrorCode, string>>} */
    static errorMessageMap = Object.freeze({
        UNKNOWN_OPERATION: "The requested operation is unknown.",
        INVALID_NAMESPACE: "The specified namespace is invalid.",
        INVALID_KEY: "The provided key is invalid.",
        INVALID_DATA_FORMAT: "The data format is invalid.",
        ID_OVERRIDE_ATTEMPT: "Attempt to override a protected ID field.",
        RECORD_NOT_FOUND: "The requested record was not found.",
        REPO_CREATION_FAILED: "Failed to create the repository.",
        REPO_ACCESS_FAILED: "Failed to access the repository.",
        FILE_NOT_FOUND: "The specified file was not found.",
        FILE_READ_ERROR: "An error occurred while reading the file.",
        FILE_WRITE_ERROR: "An error occurred while writing to the file.",
        FILE_DELETE_ERROR: "An error occurred while deleting the file.",
        FILE_SIZE_EXCEEDED: "The file size exceeds the allowed limit.",
        READ_PERMISSION_DENIED: "Read permission denied for the requested resource.",
        WRITE_PERMISSION_DENIED: "Write permission denied for the requested resource.",
        NOT_ENOUGH_DISK_SPACE: "Not enough disk space to complete the operation.",
        INVALID_JSON_IN_FILE: "The file contains invalid JSON format.",
    });

  /**
   * @param {EngineErrorCode} code
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
      message: EngineError.errorMessageMap[code],
      layer: "engine",
      severity: EngineError.severityMap[code],
    });
  }
}
