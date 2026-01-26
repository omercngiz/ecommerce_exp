/**
 * @fileoverview 
 * 
 * JSON Database Daemon Entry Point
 * 
 * Responsibilities:
 *  - Load environment configurations.
 *  - Initialize TCP server.
 *  - Start listening on configured port.
 *  - Terminate process on fatal startup errors.
 * 
 * This file represents the main runtime boundary of the application.
 * 
 * @module index
 * @author Ömer Cengiz
 * @license MIT
 * @version 1.0.0
 * 
 * Required Environment Variables:
 *  - PORT {number} - TCP server listening port.
 */


import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/** @type{import("net").Server} */
import server from './tcp-connection.js';

/**
 * Server Port
 * @type {number}
 * @default
 */
let PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initializes environment variables from .env file.
 * Fatal startup errors cause immediate process termination.
 * This entry point does not attempt recovery.
 * 
 * @throws {Error} - If PORT is not defined.
 * @returns {number} - Parsed PORT number.
 */
const loadConfig = () => {
  dotenv.config({ path: path.join(__dirname, '.env') });
  
  let rawPORT = process.env.PORT;
  if (!rawPORT) {
    throw new Error('PORT is not defined in environment variables.');
    }

  const portNumber = parseInt(rawPORT, 10);
  if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
    throw new Error(`Invalid PORT: ${rawPORT}`);
    process.exit(1);
  }
  return portNumber;
};

/**
 * Starts TCP server and begins listening on the specified port.
 * This entry point does not attempt recovery.
 * 
 * @param {number} PORT - Port number to listen on.
 * @listens net.Server#listening
 * @throws {Error} - If server fails to start listening
 */
const initServer = (PORT) => {
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

PORT = loadConfig();
initServer(PORT);