import net from 'net';
import dotenv from 'dotenv';

let PORT;

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

const server = net.createServer((socket) => {
  try {
    socket.on('data', (data) => {
      try {
        console.log(`Received: ${data.toString()}`);
      } catch (error) {
        console.error('Data error:', error.message);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error.message);
    });
  } catch (error) {
    console.error('Connection error:', error.message);
    socket.destroy();
  }
});

server.on('error', (error) => {
  try {
    if (error.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use.`);
    } else if (error.code === 'EACCES') {
      console.error(`Error: Permission denied to use port ${PORT}.`);
    } else {
      console.error('Server error:', error);
    }
  } catch (err) {
    console.error('Error handler failed:', err);
  } finally {
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`✅ TCP Server running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  try {
    server.close(() => {
      console.error('Server closed');
      process.exit(1);
    });
    
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  
  try {
    server.close(() => {
      console.error('Server closed');
      process.exit(1);
    });
    
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  
  try {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  
  try {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
});
