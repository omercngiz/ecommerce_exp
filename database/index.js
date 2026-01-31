/**
 * @fileoverview 
 * 
 * JSON Database Daemon Entry Point
 * 
 * Responsibilities:
 *  - Create TCP server instance.
 *  - Register global error handler, shutdown handler and server error handler.
 *  - Initialize server listening on configured port.
 * 
 * This file represents the main runtime boundary of the application.
 * 
 * Data flow diagram:
 * Client               --(Encoded Data Buffer)-->      "tcp-server"
 * "tcp-server"         --(Encoded Data Buffer)-->      "protocol-bridge"
 * "protocol-bridge"    --(Decoded Request Object)-->   "protocol-adapter"
 * "protocol-adapter"   --(Database Request)-->         "database-api"
 * "database-api"       --(Database Response)-->        "protocol-adapter"
 * "protocol-adapter"   --(Response Object)-->          "protocol-bridge"
 * "protocol-bridge"    --(Encoded Data Buffer)-->      "tcp-server"
 * "tcp-server"         --(Encoded Data Buffer)-->      Client
 *
 * Error flow diagram:
 * Module A(any) throws Error: caught immediately, new CustomError instance created and thrown up
 * Module B(higher level) --(catch Error)-->       "error-policy" called and error formatted
 * Module B               --(formatted error)-->   "error-logger"
 * Module B               --(formatted error)-->   "protocol-bridge"
 * "protocol-bridge"      --(Buffer response)-->   "tcp-connection"
 * "tcp-connection"       --(Buffer response)-->   Client
 * 
 * @module index
 * @author Ömer Cengiz
 * @license MIT
 * @version 2.0.0
 * 
 * Required Environment Variables:
 *  - PORT {number} - TCP server listening port.
 */

import { createServer } from './connection/tcp-connection.js';
import TCPDataHandler from './protocol/protocol-bridge.js';
import EnvConfig from './env-config.js';
import { initServer } from './middlewares/init-server.js';

import globalErrorHandler from './middlewares/global-error-handler.js';
import serverErrorHandler from './middlewares/server-error-handler.js';
import shutdownHandler from './middlewares/server-shutdown-handler.js';

/**
 * TCP Server Instance
 * @type {import("net").Server}
 */
const server = createServer(new TCPDataHandler());
globalErrorHandler(server);
shutdownHandler(server);
serverErrorHandler(server);

/**
 * Server Port
 * @type {number}
 * @default 51234
 */
let PORT = EnvConfig.get_port();
initServer(server, PORT);
