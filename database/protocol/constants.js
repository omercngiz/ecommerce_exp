// jsonDB Wire Protocol Constants

// Protocol version
export const PROTOCOL_VERSION = 1;

// Status codes
export const StatusCodes = {
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
  SOCKET_ERROR: 600
};

// Status code messages
export const StatusMessages = {
  100: 'continue',
  200: 'ok',
  201: 'created',
  202: 'accepted',
  400: 'bad request',
  404: 'not found',
  408: 'request timeout',
  411: 'length required',
  413: 'content too large',
  500: 'internal server error',
  501: 'not implemented',
  503: 'service unavailable',
  600: 'socket error'
};