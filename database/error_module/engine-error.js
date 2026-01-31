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

    })

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
      layer: "engine",
      source: source,
      severity: BaseError.SEVERITY.WARNING,
      meta,
    });
  }
}
