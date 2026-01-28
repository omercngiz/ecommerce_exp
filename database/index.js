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
 * @module index
 * @author Ömer Cengiz
 * @license MIT
 * @version 2.0.0
 * 
 * Required Environment Variables:
 *  - PORT {number} - TCP server listening port.
 */

import { createServer } from './connection/tcp-connection.js';
import TCPDataHandler from './protocol/tcp-data-handler.js';
import EnvConfig from './env-config.js';
import { initServer } from './connection/init-server.js';

import globalErrorHandler from './global-handlers/global-error-handler.js';
import serverErrorHandler from './global-handlers/server-error-handler.js';
import shutdownHandler from './global-handlers/shutdown-handler.js';

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
