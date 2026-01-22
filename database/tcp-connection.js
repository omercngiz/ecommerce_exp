/**
 * @fileoverview TCP Server Connection Manager
 * @description Manages TCP server instance with comprehensive error handling
 * @module tcp-connection
 */

import net from "net";
import Database from "./database.js";
import JSONProtocol from "./json-protocol.js";
import { StatusCodes } from "./constants.js";
import { log } from "./logger.js";

/**
 * Connected clients counter
 * @type {number}
 * @description Tracks the number of currently connected clients
 */
let connectedClients = 0;

const db = new Database();
const protocol = new JSONProtocol();

/**
 * TCP Server Instance
 * @type {net.Server}
 * @description Creates and configures a TCP server with connection and error handling
 */
const server = net.createServer((socket) => {
  try {
    /**
     * Log client connection information
     * @description Logs remote address and port when a new client connects
     */
    connectedClients++;
    const clientInfo = `${socket.remoteAddress}:${socket.remotePort}`;
    log('INFO', 'Client connected', { clientInfo, connectedClients });

    socket.accBuffer = Buffer.alloc(0);

    /**
     * Handle incoming data from connected clients
     * @event socket#data
     * @param {Buffer} data - Raw data buffer received from client
     */
    socket.on("data", async (chunk) => {
      socket.accBuffer = Buffer.concat([socket.accBuffer, chunk]);

      log('DEBUG', 'Data received', { bytes: chunk.length, chunk });

      while (true) {
        if (socket.accBuffer.length < protocol.HEADER_SIZE) {
          break;
        }

        const messageLength = socket.accBuffer.readUInt32BE(0);

        if (socket.accBuffer.length < messageLength) {
            break;
        }

        const fullMessage = socket.accBuffer.slice(0, messageLength);
        socket.accBuffer = socket.accBuffer.slice(messageLength);
        
        try {
          log('DEBUG', 'Full message received', { messageLength, fullMessage });
          const [reqID, op, ns, key, data] = protocol.decode(fullMessage);
          const [value, statusCode] = await db.handle(op, ns, key, data);
          const response = protocol.encode(reqID, value, statusCode);
          socket.write(response);
        } catch (error) {
          log('ERROR', 'Request handling error', { error });
          // Hata durumunda istemciye response gönder
          const errorResponse = protocol.encode(0, null, StatusCodes.INTERNAL_SERVER_ERROR);
          socket.write(errorResponse);
        }
      }
    });

    /**
     * Handle client disconnection
     * @event socket#end
     * @description Logs when a client gracefully closes the connection
     */
    socket.on("end", () => {
      try {
        connectedClients--;
        log('INFO', 'Client disconnected', { connectedClients });
      } catch (error) {
        log('ERROR', 'Disconnect error', { error });
      }
    });

    /**
     * Handle socket-level errors
     * @event socket#error
     * @param {Error} error - Socket error object
     */
    socket.on("error", (error) => {
      log('ERROR', 'Socket error', { error });
    });
  } catch (error) {
    log('ERROR', 'Connection error', { error });
    socket.destroy();
  }
});

/**
 * Handle server-level errors
 * @event server#error
 * @param {Error} error - Server error object
 * @description Handles critical server errors including port conflicts and permission issues
 */
server.on("error", (error) => {
  try {
    if (error.code === "EADDRINUSE") {
      log('ERROR', 'Port is already in use', { errorCode: error.code });
    } else if (error.code === "EACCES") {
      log('ERROR', 'Permission denied to use port', { errorCode: error.code });
    } else {
      log('ERROR', 'Server error', { error });
    }
  } catch (err) {
    log('ERROR', 'Error handler failed', { error: err });
  } finally {
    process.exit(1);
  }
});

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

/**
 * Handle graceful shutdown on SIGINT signal (Ctrl+C)
 * @event process#SIGINT
 * @description Closes server connections and exits gracefully with timeout fallback
 */
process.on("SIGINT", () => {
  log('INFO', 'Shutting down (SIGINT)');

  try {
    server.close(() => {
      log('INFO', 'Server closed gracefully');
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } catch (error) {
    log('ERROR', 'Shutdown error', { error });
    process.exit(1);
  }
});

/**
 * Handle graceful shutdown on SIGTERM signal
 * @event process#SIGTERM
 * @description Closes server connections and exits gracefully with timeout fallback
 */
process.on("SIGTERM", () => {
  log('INFO', 'Shutting down (SIGTERM)');

  try {
    server.close(() => {
      log('INFO', 'Server closed gracefully');
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } catch (error) {
    log('ERROR', 'Shutdown error', { error });
    process.exit(1);
  }
});

export default server;
