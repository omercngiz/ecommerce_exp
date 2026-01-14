/**
 * @fileoverview E-commerce Backend API Server
 * @description Lightweight HTTP server built with native Node.js http module
 * @author Ömer Cengiz
 * @version 1.0.0
 */

import http from 'http';
import dotenv from 'dotenv';

let PORT;

/**
 * Initialize environment configuration and validate required variables
 * @throws {Error} If PORT is not defined in environment variables
 */
try {
  dotenv.config();
  
  PORT = process.env.PORT;

  if (!PORT) {
    throw new Error('PORT is not defined in environment variables.');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

/**
 * HTTP Server Instance
 * @description Handles incoming HTTP requests with comprehensive error handling
 * @param {http.IncomingMessage} req - The HTTP request object
 * @param {http.ServerResponse} res - The HTTP response object
 */
const server = http.createServer((req, res) => {
  try {
    /**
     * Configure CORS (Cross-Origin Resource Sharing) headers
     * Allows frontend applications from different origins to make requests
     */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    /**
     * Handle preflight OPTIONS requests
     * Required by browsers for CORS validation before actual requests
     */
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    /**
     * Root endpoint - API health check
     * @route GET /
     * @returns {Object} API status information
     */
    if (req.url === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'E-commerce Backend API',
        status: 'running'
      }));
      return;
    }

    /**
     * 404 Handler - Route not found
     * @returns {Object} Error message for undefined routes
     */
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  } catch (error) {
    /**
     * Global request error handler
     * Catches unexpected errors during request processing
     */
    console.error('Request handling error:', error);
    
    // Prevent header writing if response has already been sent
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      }));
    }
  }
});

// Handle server errors (port in use, permission denied, etc.)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use.`);
    console.error('Please free the port or use a different one.');
  } else if (error.code === 'EACCES') {
    console.error(`Error: Permission denied to use port ${PORT}.`);
    console.error('Ports below 1024 require root privileges.');
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Start server and listen on specified port
server.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  
  // Give server time to finish pending requests
  server.close(() => {
    console.error('Server closed due to uncaught exception');
    process.exit(1);
  });
  
  // Force exit if server doesn't close in 5 seconds
  setTimeout(() => {
    console.error('Forcing shutdown...');
    process.exit(1);
  }, 5000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
  
  // Give server time to finish pending requests
  server.close(() => {
    console.error('Server closed due to unhandled rejection');
    process.exit(1);
  });
  
  // Force exit if server doesn't close in 5 seconds
  setTimeout(() => {
    console.error('Forcing shutdown...');
    process.exit(1);
  }, 5000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force exit if server doesn't close in 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force exit if server doesn't close in 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
});
