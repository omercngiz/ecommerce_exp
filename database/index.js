import dotenv from 'dotenv';
import server from './tcp-connection.js';

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

server.listen(PORT, () => {
  console.log(`✅ TCP Server running on port ${PORT}`);
});
