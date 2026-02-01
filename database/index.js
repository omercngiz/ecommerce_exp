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
 * "tcp-connection"       --(catch Error)-->                     "error-policy"
 * "error-policy"         --(error, formatted for server)-->     "error-logger"
 * "error-policy"         --(error, formatted for client)-->     "protocol-adapter"
 * "protocol-adapter"     --(error, formatted for protocol)-->   "error-policy"
 * "error-policy"         --(error, formatted for protocol)-->   "protocol-bridge"
 * "protocol-bridge"      --(Buffer response)-->                 "tcp-connection"
 * "tcp-connection"       --(Buffer response)-->                 Client
 * 
 * @module index
 * @author Ömer Cengiz
 * @license MIT
 * @version 2.0.0
 * 
 * Required Environment Variables:
 *  - PORT {number} - TCP server listening port.
 */

import EnvConfig from './env-config.js';
import { initServer } from './middlewares/init-server.js';
import server from './connection/init-custom-server.js';

console.log(`json-database daemon starting...`);

/**
 * Server Port
 * @type {number}
 * @default 51234
 */
let PORT = EnvConfig.get_port();
initServer(server, PORT);
