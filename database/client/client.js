/**
 * @fileoverview Database Client Class
 * @description Client wrapper class with protocol encoding capabilities
 * @module client/client
 */

import { createClient } from './tcp-connection.js';
import { encode, decode } from './plib.js';

/**
 * Database Client
 * @class Client
 * @description Manages database connection with automatic protocol encoding
 */
export class Client {
  /**
   * Create a new database client
   * @param {string} host - Server host address
   * @param {number} port - Server port number
   * @throws {Error} If client creation fails
   */
  constructor(host, port) {
    try {
      this.host = host;
      this.port = port;
      this.socket = createClient(host, port);
    } catch (error) {
      throw new Error(`Client initialization failed: ${error.message}`);
    }
  }

  /**
   * Connect to the database server
   * @throws {Error} If connection fails
   * @description Establishes TCP connection to configured host and port
   */
  connect() {
    try {
      this.socket.connect(this.port, this.host);
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  /**
   * Write data to server with protocol encoding
   * @param {Object} data - Data object to send to server
   * @throws {Error} If encoding or writing fails
   * @description Automatically encodes data using protocol library before sending
   */
  write(data) {
    try {
      const encoded = encode(data);
      this.socket.write(encoded);
    } catch (error) {
      throw new Error(`Write failed: ${error.message}`);
    }
  }

  /**
   * Register event listener on socket
   * @param {string} event - Event name (e.g., 'connect', 'data', 'close')
   * @param {Function} callback - Event handler function
   * @throws {Error} If event registration fails
   * @description Proxy method for socket event handling
   */
  on(event, callback) {
    try {
      this.socket.on(event, callback);
    } catch (error) {
      throw new Error(`Event registration failed: ${error.message}`);
    }
  }
}
