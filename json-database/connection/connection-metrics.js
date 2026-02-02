/**
 * Module for tracking TCP server metrics.
 * This module provides a simple in-memory metrics tracking system.
 *
 * Responsibilities:
 *  - Maintain counts of total and active connections.
 *  - Track bytes read and written.
 *  - Count errors encountered during TCP communication.
 *
 * @module metrics
 * @author Ömer Cengiz
 * @license MIT
 * @version 1.0.0
 */

const state = {
  totalConnections: 0,
  activeConnections: 0,
  bytesRead: 0,
  bytesWritten: 0,
  errorCount: 0,
};

export const metrics = {
  /** Increments the total and active connection counts. */
  incrementConnections() {
    state.totalConnections += 1;
    state.activeConnections += 1;
  },
  /** Decrements the active connection count. */
  decrementActiveConnections() {
    if (state.activeConnections > 0) {
      state.activeConnections -= 1;
    }
  },
  /**
   * Adds to the total bytes read.
   * @param {number} bytes - Number of bytes read
   */
  addBytesRead(bytes) {
    state.bytesRead += bytes;
  },
  /**
   * Adds to the total bytes written.
   * @param {number} bytes - Number of bytes written
   */
  addBytesWritten(bytes) {
    state.bytesWritten += bytes;
  },
  /** Increments the error count. */
  incrementErrorCount() {
    state.errorCount += 1;
  },
  /** Returns a snapshot of the current metrics state. */
  getSnapshot() {
    return { ...state };
  },
};
