import { log } from "../utils/logger.js";

/**
 * Server error handler
 * @param {import("net").Server} server 
 */
export default function serverErrorHandler(server) {
  /**
   * Handle server-level errors
   * @event server#error
   * @param {Error} error - Server error object
   * @description Handles critical server errors including port conflicts and permission issues
   */
  server.on("error", (error) => {
    try {
      if (error.code === "EADDRINUSE") {
        log("ERROR", "Port is already in use", { errorCode: error.code });
      } else if (error.code === "EACCES") {
        log("ERROR", "Permission denied to use port", {
          errorCode: error.code,
        });
      } else {
        log("ERROR", "Server error", { error });
      }
    } catch (err) {
      log("ERROR", "Error handler failed", { error: err });
    } finally {
      process.exit(1);
    }
  });
}
