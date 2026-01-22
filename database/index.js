import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import server from './tcp-connection.js';

let PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.join(__dirname, '.env') });
  
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
