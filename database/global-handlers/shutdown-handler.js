import { log } from "../utils/logger.js";

/**
 * Graceful shutdown handler
 * @param {import("net").Server} server 
 */
export default function shutdownHandler(server) {
  /**
   * Handle graceful shutdown on SIGINT signal (Ctrl+C)
   * @event process#SIGINT
   * @description Closes server connections and exits gracefully with timeout fallback
   */
  process.on("SIGINT", () => {
    log("INFO", "Shutting down (SIGINT)");

    try {
      server.close(() => {
        log("INFO", "Server closed gracefully");
        process.exit(0);
      });

      setTimeout(() => {
        process.exit(1);
      }, 10000);
    } catch (error) {
      log("ERROR", "Shutdown error", { error });
      process.exit(1);
    }
  });

  /**
   * Handle graceful shutdown on SIGTERM signal
   * @event process#SIGTERM
   * @description Closes server connections and exits gracefully with timeout fallback
   */
  process.on("SIGTERM", () => {
    log("INFO", "Shutting down (SIGTERM)");

    try {
      server.close(() => {
        log("INFO", "Server closed gracefully");
        process.exit(0);
      });

      setTimeout(() => {
        process.exit(1);
      }, 10000);
    } catch (error) {
      log("ERROR", "Shutdown error", { error });
      process.exit(1);
    }
  });
}
