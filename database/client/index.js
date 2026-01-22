/**
 * @fileoverview Database Client Application Entry Point
 * @description Main entry point for the database client application with CLI interface
 * @module client/index
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from './client.js';
import { ClientCLI } from './cli.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables from .env file
 * @throws {Error} If environment configuration fails
 */
try {
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch (error) {
  console.error('Failed to load environment configuration:', error.message);
  process.exit(1);
}

/**
 * Validate required environment variables
 * @throws {Error} If HOST or PORT is not defined
 */
if (!process.env.HOST || !process.env.PORT) {
  console.error('Error: HOST and PORT must be defined in environment variables');
  process.exit(1);
}

/**
 * Database client instance
 * @type {Client}
 * @description Creates a new client connection with host and port from environment
 */
let client;

try {
  client = new Client(process.env.HOST, process.env.PORT);
} catch (error) {
  console.error('Failed to create client:', error.message);
  process.exit(1);
}

/**
 * CLI interface instance
 * @type {ClientCLI}
 * @description Interactive command-line interface for client operations
 */
let cli;

try {
  cli = new ClientCLI((input) => {
    try {
      client.write(input);
    } catch (error) {
      console.error('Failed to write data:', error.message);
    }
  });
} catch (error) {
  console.error('Failed to create CLI:', error.message);
  process.exit(1);
}

/**
 * Start CLI interface when connected to server
 * @event client#connect
 * @description Begins interactive CLI session after successful connection
 */
try {
  client.on('connect', () => {
    try {
      cli.start();
    } catch (error) {
      console.error('Failed to start CLI:', error.message);
    }
  });
} catch (error) {
  console.error('Failed to set up connection handler:', error.message);
  process.exit(1);
}

/**
 * Initiate connection to database server
 * @description Establishes TCP connection using configured host and port
 */
try {
  client.connect();
} catch (error) {
  console.error('Failed to connect to server:', error.message);
  process.exit(1);
}