/**
 * Protocol Adapter Module
 *
 * Adapts database errors to the given protocol error format used by the application.
 *
 * @module database/error_module/protocol-adapter
 */

import ConnectionError from "./domains/connection-error.js";
import EngineError from "./domains/engine-error.js";
import ProtocolError from "./domains/protocol-error.js";
import ValidationError from "./domains/validation-error.js";

/**
 * ProtocolAdapter class to adapt errors to different protocol formats.
 */
export class ProtocolAdapter {
  simpleProtocolStatusCodes = {
    CONTINUE: 100,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    LENGTH_REQUIRED: 411,
    CONTENT_TOO_LARGE: 413,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
    SOCKET_ERROR: 600,
  };

  simpleProtocolErrorMessages = {
    100: "continue",
    200: "ok",
    201: "created",
    202: "accepted",
    400: "bad request",
    404: "not found",
    408: "request timeout",
    411: "length required",
    413: "content too large",
    500: "internal server error",
    501: "not implemented",
    503: "service unavailable",
    600: "socket error",
  };

  protocolVersionMap = {
    SIMPLE_PROTOCOL: "1.0.0",
  };

  databaseErrorToSimpleProtocolErrorMap = {
    [ConnectionError.codes.SOCKET_TIMEOUT]: 408,
    [ConnectionError.codes.CONNECTION_REFUSED]: 500,
    [ConnectionError.codes.CONNECTION_RESET]: 500,
    [ConnectionError.codes.UNKNOWN_HOST]: 500,
    [ConnectionError.codes.MAX_CONNECTION_REACHED]: 503,
    [ConnectionError.codes.NO_RESPONSE_GENERATED]: 500,
    [ConnectionError.codes.SOCKET_ERROR]: 600,

    [EngineError.codes.UNKNOWN_OPERATION]: 400,
    [EngineError.codes.INVALID_NAMESPACE]: 400,
    [EngineError.codes.INVALID_KEY]: 400,
    [EngineError.codes.INVALID_DATA_FORMAT]: 400,
    [EngineError.codes.ID_OVERRIDE_ATTEMPT]: 400,
    [EngineError.codes.RECORD_NOT_FOUND]: 404,
    [EngineError.codes.REPO_CREATION_FAILED]: 500,
    [EngineError.codes.REPO_ACCESS_FAILED]: 500,
    [EngineError.codes.FILE_NOT_FOUND]: 404,
    [EngineError.codes.FILE_READ_ERROR]: 500,
    [EngineError.codes.FILE_WRITE_ERROR]: 500,
    [EngineError.codes.FILE_DELETE_ERROR]: 500,
    [EngineError.codes.FILE_SIZE_EXCEEDED]: 413,
    [EngineError.codes.READ_PERMISSION_DENIED]: 500,
    [EngineError.codes.WRITE_PERMISSION_DENIED]: 500,
    [EngineError.codes.NOT_ENOUGH_DISK_SPACE]: 500,
    [EngineError.codes.INVALID_JSON_IN_FILE]: 400,

    [ProtocolError.codes.INVALID_FORMAT]: 400,
    [ProtocolError.codes.UNSUPPORTED_VERSION]: 400,
    [ProtocolError.codes.DISTORTED_HEADER]: 400,
    [ProtocolError.codes.SERIALIZATION_FAILURE]: 500,
    [ProtocolError.codes.ENCODING_ERROR]: 500,
    [ProtocolError.codes.DECODING_ERROR]: 500,

    [ValidationError.codes.INVALID_INPUT]: 400,
    [ValidationError.codes.INVALID_TYPE]: 400,
    [ValidationError.codes.MISSING_FIELD]: 400,
    [ValidationError.codes.PATTERN_MISMATCH]: 400,
    [ValidationError.codes.TYPE_MISMATCH]: 400,
    [ValidationError.codes.OUT_OF_RANGE]: 400,
    [ValidationError.codes.TOO_LONG]: 400,
    [ValidationError.codes.TOO_SHORT]: 400,
    [ValidationError.codes.EMPTY_VALUE]: 400,
    [ValidationError.codes.NOT_EQUAL]: 400,
  };

  static simpleProtocolAdapter(error) {
    /*
    let statusCode = this.prototype.databaseErrorToSimpleProtocolErrorMap[error.code];
    let message = this.prototype.simpleProtocolErrorMessages[statusCode];
    if (error.layer === "validation") {
      const value = error.message || {};
    }
    return {statusCode, message, value};
  }*/
}
