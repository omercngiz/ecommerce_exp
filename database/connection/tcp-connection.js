/**
 * @fileoverview
 *
 * TCP Server Connection Manager
 *
 * This module sets up a TCP server that listens for incoming client connections.
 * It establishes the communication bridge between the user and the json-database.
 *
 * Data transmissions are handled using a custom simple protocol.
 *
 * Data flow diagram:
 * Client           --(Encoded Data Buffer)-->      TCP Server
 * TCP Server       --(Encoded Data Buffer)-->      Simple protocol
 * Simple protocol  --(Decoded Request Object)-->   JSON Database
 * JSON Database    --(Response Object)-->          Simple protocol
 * Simple protocol  --(Encoded Data Buffer)-->      TCP Server
 * TCP Server       --(Encoded Data Buffer)-->      Client
 *
 * MAX_PAYLOAD_SIZE = configurable via .env (default: 5 MB)
 * MAX_CONNECTIONS = configurable via .env (default: 1000)
 * TIMEOUT_MS = configurable via .env (default: 300000 ms)
 *
 * Responsibilities:
 *  - Create TCP server instance.
 *  - Handle client connections and data transmission.
 *  - Avoid memory leaks by cleaning up event listeners.
 *  - Enforce connection limits and timeouts.
 *  - Log connection events and errors.
 *  - Update TCP server metrics.
 *  - Emit errors via 'error' events on server or socket.
 * 
 * Caution:
 *  - Event loop could be blocked by data event handler.
 *    Data event pouses the socket until data is fully processed.
 *
 * @module tcp-connection
 * @author Ömer Cengiz
 * @license MIT
 * @version 1.0.0
 */

import net from "net";
import { log } from "../utils/logger.js";
import EnvConfig from "../env-config.js";
import { metrics } from "./metrics.js";

/**
 * Creates and returns a TCP server instance that:
 *  - Listens for data from clients,
 *  - processes it using the TCPDataHandler class.
 *  - Handles errors, logs them and sends informative responses.
 *  - Ensures proper socket closure.
 *
 * Errors are emitted via 'error' events on the server or socket.
 * 
 * @typedef {import("../protocol/protocol-bridge.js").default} TCPDataHandler
 * @param {TCPDataHandler} DataHandler - Instance of TCPDataHandler class
 * @returns {import("net").Server} - TCP Server Instance
 * 
 * @example
 * import { createServer } from './tcp-connection.js';
 * import { handleData } from './data-handler.js';
 * 
 * const server = createServer(new TCPDataHandler());
 * server.listen(51234);
 */
export function createServer(DataHandler) {
  return net.createServer((socket) => {
    if (metrics.getSnapshot().activeConnections >= EnvConfig.get_max_connections()) {
      log(
        "WARN",
        "Maximum connections reached, rejecting new connection",
        socket.remotePort,
      );
      metrics.incrementErrorCount();
      DataHandler.handleSocketError("Server at max capacity");
      socket.destroy();
      return;
    }
    
    metrics.incrementConnections();
    log(
      "INFO",
      `New client connected from ${socket.remoteAddress}:${socket.remotePort}`,
    );

    socket.setTimeout(EnvConfig.get_timeout_ms());
    socket.setKeepAlive(true, EnvConfig.get_timeout_ms());

    /**
     * Socket 'timeout' event handler.
     *
     * Logs a warning and destroys the socket on timeout.
     * Removes all listeners to prevent memory leaks.
     * 
     * TIMEOUT_MS is configurable via .env (default: 300000 ms).
     *
     * @event timeout
     */
    socket.on("timeout", () => {
      log("WARN", "Socket timeout, destroying connection");
      metrics.incrementErrorCount();
      socket.write(DataHandler.handleSocketError("Socket timeout"));
      socket.destroy();
      socket.removeAllListeners();
    });

    /**
     * Socket 'data' event handler
     *
     * Changes the socket to paused state,
     * passes incoming data to handleData(),
     * gets the response and writes it back to the client,
     * and changes the socket state to resumed.
     *
     * Increments bytes read/written metrics.
     * Handles errors by logging and destroys the socket.
     * Removes all listeners to prevent memory leaks.
     *
     * @event data
     * @param {Buffer} chunk - Incoming data chunk from client
     */
    socket.on("data", async (chunk) => {
      try {
        socket.pause();
        metrics.addBytesRead(chunk.length);
        const response = await DataHandler.handleRequest(chunk);
        if (Buffer.isBuffer(response)) {
          socket.write(response);
          metrics.addBytesWritten(response.length);
        } else {
          log("WARN", "No response generated for the received data chunk");
          socket.write(DataHandler.handleSocketError("No response generated"));
        }
        socket.resume();
      } catch (error) {
        log("ERROR", "Data handling failed", { error });
        metrics.incrementErrorCount();
        socket.write(DataHandler.handleSocketError("Data handling failed"));
        socket.destroy();
        socket.removeAllListeners();
      }
    });

    /**
     * Socket 'end' event handler.
     *
     * Logs client disconnection info.
     * Removes all listeners to prevent memory leaks.
     *
     * @event end
     */
    socket.on("end", () => {
      log(
        "INFO",
        "Client sent FIN packet, closing connection",
        socket.remotePort,
      );
    });

    /**
     * Socket 'close' event handler.
     *
     * Logs socket closure info.
     * Removes all listeners to prevent memory leaks.
     *
     * @event close
     * @param {boolean} hadError - Indicates if socket closed due to an error
     */
    socket.on("close", (hadError) => {
      log(
        "INFO",
        `Socket closed ${hadError ? "with error" : "without error"}`,
        socket.remotePort,
      );
      metrics.decrementActiveConnections();
    });

    /**
     * Socket 'error' event handler.
     *
     * Logs the error and destroys the socket.
     * Removes all listeners to prevent memory leaks.
     *
     * @event error
     * @param {Error} error - Error object
     */
    socket.on("error", (error) => {
      log("ERROR", "Socket error", { error });
      socket.write(DataHandler.handleSocketError(error.message));
      metrics.incrementErrorCount();
      socket.destroy();
    });
  });
}
