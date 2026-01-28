/**
 * Starts TCP server and begins listening on the specified port.
 * This entry point does not attempt recovery.
 * 
 * @param {import("net").Server} server - TCP server instance to initialize.
 * @param {number} PORT - Port number to listen on.
 * @listens net.Server#listening
 * @throws {Error} - If server fails to start listening
 */
export const initServer = (server, PORT) => {
  try {
    server.listen(PORT, () => {
      console.log(`✅ TCP Server running on port ${PORT}`);
    });
  } catch (error) {
    if(error instanceof Error) {
      console.error('Fatal error starting TCP server:', error.message);
    }else {
      console.error('Unknown fatal error starting TCP server:', error);
    }
    process.exit(1);
  }
};
