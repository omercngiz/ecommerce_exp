/**
 * Defines error formats.
 * 2 formats:
 *  - Server Error Format
 *  - Client Error Format
 * 
 * Server Error format is used for logging and internal tracking.
 * Client Error format is used for sending error responses to clients.
 */

export function resolveErrorPolicy(error) {
  return {
    log: {
      enabled: true,
      level: error.severity,
    },

    client: {
      expose: error.layer === "validation" || error.layer === "protocol",
      message: mapClientMessage(error),
      code: mapClientCode(error),
    },

    retryable: isRetryable(error),
  };
}
