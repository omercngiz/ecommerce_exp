import { log } from '../utils/logger.js';

/**
 * Global error handler for uncaught exceptions and unhandled rejections
 * @param {import("net").Server} server 
 */
export default function globalErrorHandler(server) {
  /**
  * Handle uncaught exceptions globally
  * @event process#uncaughtException
  * @param {Error} error - Uncaught exception error object
  * @description Attempts graceful shutdown before exiting with error code
  */
  process.on("uncaughtException", (error) => {
    log('ERROR', 'Uncaught exception', { error });

    try {
      server.close(() => {
        log('INFO', 'Server closed due to uncaught exception');
        process.exit(1);
      });

      setTimeout(() => {
        process.exit(1);
      }, 5000);
    } catch (err) {
      log('ERROR', 'Shutdown error', { error: err });
      process.exit(1);
    }
  });

  /**
   * Handle unhandled promise rejections globally
   * @event process#unhandledRejection
   * @param {*} reason - Rejection reason
   * @description Attempts graceful shutdown before exiting with error code
   */
  process.on("unhandledRejection", (reason) => {
    log('ERROR', 'Unhandled rejection', { reason });

    try {
      server.close(() => {
        log('INFO', 'Server closed due to unhandled rejection');
        process.exit(1);
      });

      setTimeout(() => {
        process.exit(1);
      }, 5000);
    } catch (err) {
      log('ERROR', 'Shutdown error', { error: err });
      process.exit(1);
    }
  });
}
