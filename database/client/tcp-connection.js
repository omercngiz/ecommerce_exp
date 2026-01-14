/**
 * @fileoverview TCP Client Connection Manager
 * @description Manages TCP client connection with comprehensive error handling
 * @module tcp-connection
 */

import net from 'net';

/**
 * Create TCP client connection
 * @param {string} host - Server host address
 * @param {number} port - Server port number
 * @returns {net.Socket} TCP socket connection
 * @description Creates and configures a TCP client with connection and error handling
 */
export const createClient = (host, port) => {
  try {
    const client = new net.Socket();

    /**
     * Handle successful connection to server
     * @event client#connect
     * @description Logs when successfully connected to the server
     */
    client.on('connect', () => {
      try {
        console.log(`Connected to server: ${host}:${port}`);
      } catch (error) {
        console.error('Connect log error:', error.message);
      }
    });

    /**
     * Handle incoming data from server
     * @event client#data
     * @param {Buffer} data - Raw data buffer received from server
     */
    client.on('data', (data) => {
      try {
        console.log(`Received: ${data.toString()}`);
      } catch (error) {
        console.error('Data error:', error.message);
      }
    });

    /**
     * Handle server disconnection
     * @event client#close
     * @description Logs when connection to server is closed
     */
    client.on('close', () => {
      try {
        console.log('Connection closed');
      } catch (error) {
        console.error('Close error:', error.message);
      }
    });

    /**
     * Handle client connection errors
     * @event client#error
     * @param {Error} error - Client error object
     */
    client.on('error', (error) => {
      try {
        if (error.code === 'ECONNREFUSED') {
          console.error(`Error: Connection refused to ${host}:${port}`);
        } else if (error.code === 'ETIMEDOUT') {
          console.error(`Error: Connection timeout to ${host}:${port}`);
        } else {
          console.error('Client error:', error.message);
        }
      } catch (err) {
        console.error('Error handler failed:', err);
      }
    });

    /**
     * Handle graceful shutdown on SIGINT signal (Ctrl+C)
     * @event process#SIGINT
     * @description Closes client connection and exits gracefully
     */
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      
      try {
        client.destroy();
        console.log('Client closed');
        process.exit(0);
      } catch (error) {
        console.error('Shutdown error:', error);
        process.exit(1);
      }
    });

    /**
     * Handle graceful shutdown on SIGTERM signal
     * @event process#SIGTERM
     * @description Closes client connection and exits gracefully
     */
    process.on('SIGTERM', () => {
      console.log('\nShutting down...');
      
      try {
        client.destroy();
        console.log('Client closed');
        process.exit(0);
      } catch (error) {
        console.error('Shutdown error:', error);
        process.exit(1);
      }
    });

    return client;
  } catch (error) {
    console.error('Client creation error:', error.message);
    throw error;
  }
};