import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StatusCodes } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO = path.join(__dirname, 'repository');

/**
 * Read data from a namespace JSON file
 * @param {string} namespace - The namespace (filename without extension)
 * @returns {[Object|Array|null, number]} Tuple of [data, statusCode]
 */
export function readFile(namespace) {
  try {
    const filePath = path.join(REPO, `${namespace}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return [data, StatusCodes.OK];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [null, StatusCodes.NOT_FOUND];
    }
    if (error instanceof SyntaxError) {
      return [null, StatusCodes.BAD_REQUEST];
    }
    return [null, StatusCodes.INTERNAL_SERVER_ERROR];
  }
}

/**
 * Write data to a namespace JSON file
 * @param {string} ns - The namespace (filename without extension)
 * @param {Object|Array} data - Data to write to the file
 * @returns {[null, number]} Tuple of [null, statusCode]
 */
export function writeFile(ns, data) {
  try {
    const filePath = path.join(REPO, `${ns}.json`);
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
    return [null, StatusCodes.OK];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [null, StatusCodes.NOT_FOUND];
    }
    if (error.code === 'EACCES') {
      return [null, StatusCodes.INTERNAL_SERVER_ERROR];
    }
    return [null, StatusCodes.INTERNAL_SERVER_ERROR];
  }
}