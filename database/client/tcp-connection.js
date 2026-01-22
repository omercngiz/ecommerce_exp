/**
 * @fileoverview TCP Client Connection with Interactive CLI
 * @description Standalone TCP client that connects to database server,
 *              handles bidirectional communication with message buffering,
 *              and provides an interactive CLI interface
 * @module client/tcp-connection
 */

import net from 'net';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { encode, decode } from './plib.js';

// ============================================================================
// Configuration Loading
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables
 */
try {
  dotenv.config({ path: path.join(__dirname, '.env') });
} catch (error) {
  console.error('Failed to load .env file:', error.message);
  process.exit(1);
}

/**
 * Server configuration from environment
 */
const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT, 10) || 8080;

/**
 * Validate HOST configuration
 */
if (!HOST || typeof HOST !== 'string' || HOST.trim().length === 0) {
  console.error('Invalid HOST configuration: HOST cannot be empty');
  process.exit(1);
}

/**
 * Validate PORT configuration
 */
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`Invalid PORT configuration: ${process.env.PORT}. Must be between 1-65535`);
  process.exit(1);
}

// ============================================================================
// TCP Client Setup
// ============================================================================

/**
 * TCP Client Instance
 * @type {net.Socket}
 */
const client = new net.Socket();

/**
 * Client connection state
 * @type {boolean}
 */
let isConnected = false;

/**
 * Accumulator buffer for handling partial messages
 * @type {Buffer}
 */
client.accBuffer = Buffer.alloc(0);

/**
 * Readline interface for CLI
 * @type {readline.Interface}
 */
let rl = null;

// ============================================================================
// Command Parsing
// ============================================================================

/**
 * Parse CLI command into operation components
 * 
 * @param {string} input - User input command
 * @returns {[string, string|null, string|null, Object|null]|null} Tuple of [op, ns, key, value] or null if invalid
 * 
 * @example
 * parseCommand('CREATE users {"name":"John"}') 
 * // Returns: ['CREATE', 'users', null, {name:"John"}]
 * 
 * parseCommand('READ users user123')
 * // Returns: ['READ', 'users', 'user123', null]
 */
function parseCommand(input) {
  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    // Split by whitespace, but preserve JSON objects
    const parts = [];
    let current = '';
    let inJson = false;
    let braceCount = 0;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      
      if (char === '{') {
        inJson = true;
        braceCount++;
        current += char;
      } else if (char === '}') {
        braceCount--;
        current += char;
        if (braceCount === 0) {
          inJson = false;
        }
      } else if (char === ' ' && !inJson) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }

    if (parts.length === 0) {
      return null;
    }

    // Parse operation
    const op = parts[0].toUpperCase();
    
    // Validate operation
    const validOps = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
    if (!validOps.includes(op)) {
      console.error(`Invalid operation: ${parts[0]}. Valid operations: CREATE, READ, UPDATE, DELETE`);
      return null;
    }

    // Parse namespace (required for all operations)
    const ns = parts[1] || null;
    if (!ns) {
      console.error('Namespace is required');
      return null;
    }

    let key = null;
    let value = null;

    // Parse based on operation
    if (op === 'CREATE') {
      // CREATE users {"name":"John","age":30}
      if (parts.length < 3) {
        console.error('CREATE requires data: CREATE <namespace> <json_data>');
        return null;
      }
      try {
        value = JSON.parse(parts[2]);
      } catch (error) {
        console.error('Invalid JSON data:', error.message);
        return null;
      }
    } else if (op === 'READ') {
      // READ users [key]
      key = parts[2] || null;
    } else if (op === 'UPDATE') {
      // UPDATE users user123 {"name":"Jane"}
      if (parts.length < 4) {
        console.error('UPDATE requires key and data: UPDATE <namespace> <key> <json_data>');
        return null;
      }
      key = parts[2];
      try {
        value = JSON.parse(parts[3]);
      } catch (error) {
        console.error('Invalid JSON data:', error.message);
        return null;
      }
    } else if (op === 'DELETE') {
      // DELETE users user123
      if (parts.length < 3) {
        console.error('DELETE requires key: DELETE <namespace> <key>');
        return null;
      }
      key = parts[2];
    }

    return [op, ns, key, value];
  } catch (error) {
    console.error('Command parsing error:', error.message);
    return null;
  }
}

// ============================================================================
// Message Handling
// ============================================================================

/**
 * Process a complete message buffer from server
 * 
 * @param {Buffer} messageBuffer - Complete message buffer to decode and display
 */
function processMessage(messageBuffer) {
  try {
    const response = decode(messageBuffer);
    
    // Format and display response
    console.log('\n' + '='.repeat(60));
    console.log('Response:');
    console.log('  Status:', response.status, '-', response.message);
    
    if (response.value !== null && response.value !== undefined) {
      console.log('  Data:', JSON.stringify(response.value, null, 2));
    }
    
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('Failed to decode message:', error.message);
  }
}

/**
 * Send a command to the server
 * 
 * @param {string} op - Operation (CREATE, READ, UPDATE, DELETE)
 * @param {string|null} ns - Namespace
 * @param {string|null} key - Key
 * @param {Object|null} value - Value data
 */
function sendCommand(op, ns, key, value) {
  try {
    if (!isConnected) {
      console.error('Error: Not connected to server');
      return;
    }

    // Encode the request
    const request = encode(op, ns, key, value);

    // Send to server
    const success = client.write(request, (error) => {
      if (error) {
        console.error('Write error:', error.message);
      }
    });

    if (!success) {
      console.error('Warning: Write buffer is full');
    }
  } catch (error) {
    console.error('Failed to send command:', error.message);
  }
}

// ============================================================================
// TCP Event Handlers
// ============================================================================

/**
 * Handle successful connection to server
 * @event client#connect
 */
client.on('connect', () => {
  try {
    isConnected = true;
    console.log(`\n✓ Connected to server: ${HOST}:${PORT}\n`);
    console.log('Available commands:');
    console.log('  CREATE <namespace> <json_data>');
    console.log('  READ <namespace> [key]');
    console.log('  UPDATE <namespace> <key> <json_data>');
    console.log('  DELETE <namespace> <key>');
    console.log('\nExamples:');
    console.log('  CREATE users {"name":"John","age":30}');
    console.log('  READ users');
    console.log('  READ users user123');
    console.log('  UPDATE users user123 {"name":"Jane","age":31}');
    console.log('  DELETE users user123\n');
    
    // Start CLI after connection
    startCLI();
  } catch (error) {
    console.error('Connect handler error:', error.message);
  }
});

/**
 * Handle incoming data from server
 * @event client#data
 * @param {Buffer} chunk - Raw data chunk from server
 */
client.on('data', (chunk) => {
  try {
    // Accumulate incoming data
    client.accBuffer = Buffer.concat([client.accBuffer, chunk]);
    
    // Process all complete messages in buffer
    while (client.accBuffer.length >= 12) {
      // Read message length from header (first 4 bytes)
      const messageLength = client.accBuffer.readUInt32BE(0);
      
      // Validate message length
      if (messageLength < 12 || messageLength > 10 * 1024 * 1024) {
        console.error('Invalid message length:', messageLength);
        client.accBuffer = Buffer.alloc(0);
        break;
      }
      
      // Check if we have the complete message
      if (client.accBuffer.length < messageLength) {
        break;
      }
      
      // Extract the complete message
      const fullMessage = client.accBuffer.slice(0, messageLength);
      client.accBuffer = client.accBuffer.slice(messageLength);
      
      // Process the message
      processMessage(fullMessage);
    }
    
    // Show prompt again after processing
    if (rl) {
      rl.prompt();
    }
  } catch (error) {
    console.error('Data processing error:', error.message);
    client.accBuffer = Buffer.alloc(0);
  }
});

/**
 * Handle server disconnection
 * @event client#close
 */
client.on('close', () => {
  try {
    isConnected = false;
    console.log('\n✗ Connection closed\n');
    
    if (rl) {
      rl.close();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Close handler error:', error.message);
    process.exit(1);
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
      console.error(`\n✗ Connection refused to ${HOST}:${PORT}`);
      console.error('Make sure the server is running.\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`\n✗ Connection timeout to ${HOST}:${PORT}\n`);
    } else if (error.code === 'ENOTFOUND') {
      console.error(`\n✗ Host not found: ${HOST}\n`);
    } else if (error.code === 'ECONNRESET') {
      console.error('\n✗ Connection reset by server\n');
    } else {
      console.error('\n✗ Client error:', error.message, '\n');
    }
  } catch (err) {
    console.error('Error handler failed:', err);
  }
});

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Start interactive CLI interface
 */
function startCLI() {
  try {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    rl.prompt();

    rl.on('line', (input) => {
      try {
        const trimmed = input.trim();
        
        if (!trimmed) {
          rl.prompt();
          return;
        }

        // Parse and send command
        const parsed = parseCommand(trimmed);
        if (parsed) {
          const [op, ns, key, value] = parsed;
          sendCommand(op, ns, key, value);
        }
        
        // Prompt will be shown again after response is received
      } catch (error) {
        console.error('Input processing error:', error.message);
        rl.prompt();
      }
    });

    rl.on('close', () => {
      console.log('\n✓ Exiting...\n');
      if (isConnected) {
        client.destroy();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start CLI:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// Process Error Handlers
// ============================================================================

/**
 * Handle uncaught exceptions
 * @event process#uncaughtException
 * @param {Error} error - Uncaught exception error
 */
process.on('uncaughtException', (error) => {
  console.error('\n✗ Uncaught Exception:', error.message);
  console.error(error.stack);

  try {
    if (rl) {
      rl.close();
    }
    if (isConnected) {
      client.destroy();
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    process.exit(1);
  }
});

/**
 * Handle unhandled promise rejections
 * @event process#unhandledRejection
 * @param {*} reason - Rejection reason
 */
process.on('unhandledRejection', (reason) => {
  console.error('\n✗ Unhandled Rejection:', reason);

  try {
    if (rl) {
      rl.close();
    }
    if (isConnected) {
      client.destroy();
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    process.exit(1);
  }
});

/**
 * Handle SIGINT signal (Ctrl+C)
 * @event process#SIGINT
 */
process.on('SIGINT', () => {
  console.log('\n\n✓ Shutting down...\n');
  
  try {
    if (rl) {
      rl.close();
    }
    if (isConnected) {
      client.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
});

/**
 * Handle SIGTERM signal
 * @event process#SIGTERM
 */
process.on('SIGTERM', () => {
  console.log('\n\n✓ Shutting down...\n');
  
  try {
    if (rl) {
      rl.close();
    }
    if (isConnected) {
      client.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
});

// ============================================================================
// Initialize Connection
// ============================================================================

console.log(`\n→ Connecting to ${HOST}:${PORT}...\n`);

try {
  client.connect(PORT, HOST);
} catch (error) {
  console.error('Failed to initiate connection:', error.message);
  process.exit(1);
}
