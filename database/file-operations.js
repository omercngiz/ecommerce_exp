import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StatusCodes } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Repository directory path */
const REPO = path.join(__dirname, 'repository');

/** Maximum file size allowed (5MB) to prevent memory issues */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Valid namespace pattern: alphanumeric, hyphens, underscores */
const NAMESPACE_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate namespace string
 * 
 * @param {string} namespace - The namespace to validate
 * @throws {TypeError} If namespace is not a string
 * @throws {Error} If namespace is empty or contains invalid characters
 * @private
 */
function validateNamespace(namespace) {
  if (typeof namespace !== 'string') {
    throw new TypeError(`Namespace must be a string, got ${typeof namespace}`);
  }

  if (!namespace || namespace.trim().length === 0) {
    throw new Error('Namespace cannot be empty');
  }

  if (!NAMESPACE_PATTERN.test(namespace)) {
    throw new Error(
      `Invalid namespace: "${namespace}". Only alphanumeric characters, hyphens, and underscores are allowed`
    );
  }

  if (namespace.length > 255) {
    throw new Error(`Namespace too long: maximum 255 characters, got ${namespace.length}`);
  }

  // Prevent directory traversal attacks
  if (namespace.includes('..') || namespace.includes('/') || namespace.includes('\\')) {
    throw new Error('Namespace cannot contain path traversal characters');
  }
}

/**
 * Ensure repository directory exists
 * 
 * @returns {Promise<void>}
 * @throws {Error} If directory cannot be created
 * @private
 */
async function ensureRepositoryExists() {
  try {
    await fs.access(REPO);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.mkdir(REPO, { recursive: true });
      } catch (mkdirError) {
        throw new Error(`Failed to create repository directory: ${mkdirError.message}`);
      }
    } else {
      throw new Error(`Failed to access repository directory: ${error.message}`);
    }
  }
}

/**
 * Read data from a namespace JSON file (async)
 * 
 * @param {string} namespace - The namespace (filename without extension)
 * @returns {Promise<[Object|Array|null, number]>} Promise resolving to tuple of [data, statusCode]
 * 
 * @throws {TypeError} If namespace is not a string
 * @throws {Error} If namespace is invalid
 * 
 * @example
 * const [data, status] = await readFile('users');
 * if (status === StatusCodes.OK) {
 *   console.log('Users:', data);
 * }
 */
export async function readFile(namespace) {
  try {
    // Validate namespace
    validateNamespace(namespace);

    const filePath = path.join(REPO, `${namespace}.json`);
    
    // Check if file exists and get stats
    let stats;
    try {
      stats = await fs.stat(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [null, StatusCodes.NOT_FOUND];
      }
      throw error;
    }

    // Check file size
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size ${stats.size} exceeds maximum allowed size ${MAX_FILE_SIZE}`
      );
    }

    // Read file content
    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error.code === 'EACCES') {
        throw new Error(`Permission denied reading file: ${namespace}.json`);
      }
      throw error;
    }

    // Parse JSON
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(
        `Invalid JSON in file ${namespace}.json: ${error.message}`
      );
    }

    // Validate data structure (should be array or object)
    if (data === null || (typeof data !== 'object')) {
      throw new Error(`Invalid data structure in ${namespace}.json: expected object or array`);
    }

    return [data, StatusCodes.OK];
  } catch (error) {
    // Handle known error types
    if (error instanceof TypeError) {
      return [null, StatusCodes.BAD_REQUEST];
    }

    if (error.message.includes('Invalid JSON') || error.message.includes('Invalid data structure')) {
      return [null, StatusCodes.BAD_REQUEST];
    }

    if (error.message.includes('Permission denied')) {
      return [null, StatusCodes.INTERNAL_SERVER_ERROR];
    }

    if (error.code === 'ENOENT') {
      return [null, StatusCodes.NOT_FOUND];
    }

    // Log unexpected errors for debugging
    console.error(`[readFile] Unexpected error for namespace "${namespace}":`, error);
    return [null, StatusCodes.INTERNAL_SERVER_ERROR];
  }
}

/**
 * Write data to a namespace JSON file (async)
 * 
 * @param {string} ns - The namespace (filename without extension)
 * @param {Object|Array} data - Data to write to the file
 * @returns {Promise<[null, number]>} Promise resolving to tuple of [null, statusCode]
 * 
 * @throws {TypeError} If namespace is not a string or data is invalid
 * @throws {Error} If namespace is invalid or write operation fails
 * 
 * @example
 * const users = [{id: '1', name: 'John'}];
 * const [, status] = await writeFile('users', users);
 * if (status === StatusCodes.OK) {
 *   console.log('Data saved successfully');
 * }
 */
export async function writeFile(ns, data) {
  try {
    // Validate namespace
    validateNamespace(ns);

    // Validate data
    if (data === null || data === undefined) {
      throw new TypeError('Data cannot be null or undefined');
    }

    if (typeof data !== 'object') {
      throw new TypeError(`Data must be an object or array, got ${typeof data}`);
    }

    // Ensure repository directory exists
    await ensureRepositoryExists();

    const filePath = path.join(REPO, `${ns}.json`);

    // Convert data to JSON string
    let jsonContent;
    try {
      jsonContent = JSON.stringify(data, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize data to JSON: ${error.message}`);
    }

    // Check serialized size
    const contentSize = Buffer.byteLength(jsonContent, 'utf-8');
    if (contentSize > MAX_FILE_SIZE) {
      throw new Error(
        `Serialized data size ${contentSize} exceeds maximum allowed size ${MAX_FILE_SIZE}`
      );
    }

    // Write to temporary file first (atomic write)
    const tempFilePath = `${filePath}.tmp`;
    try {
      await fs.writeFile(tempFilePath, jsonContent, 'utf-8');
      // Atomic rename
      await fs.rename(tempFilePath, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }

      if (error.code === 'EACCES') {
        throw new Error(`Permission denied writing file: ${ns}.json`);
      }
      if (error.code === 'ENOSPC') {
        throw new Error('Not enough disk space');
      }
      throw error;
    }

    return [null, StatusCodes.OK];
  } catch (error) {
    // Handle known error types
    if (error instanceof TypeError) {
      return [null, StatusCodes.BAD_REQUEST];
    }

    if (error.message.includes('Invalid namespace') || 
        error.message.includes('Failed to serialize')) {
      return [null, StatusCodes.BAD_REQUEST];
    }

    if (error.message.includes('Permission denied') || 
        error.message.includes('Not enough disk space') ||
        error.message.includes('exceeds maximum allowed size')) {
      return [null, StatusCodes.INTERNAL_SERVER_ERROR];
    }

    // Log unexpected errors for debugging
    console.error(`[writeFile] Unexpected error for namespace "${ns}":`, error);
    return [null, StatusCodes.INTERNAL_SERVER_ERROR];
  }
}