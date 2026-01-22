/**
 * Generates a unique 16-digit random ID
 * @returns {string} A 16-digit string of random numbers
 */
export function generateId() {
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
}

/**
 * Generates a 32-bit unsigned integer ID
 * @returns {number} A 32-bit unsigned integer (0 - 4294967295)
 */
export function generate32BitId() {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}