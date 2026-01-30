import { generateId } from "../utils/utils.js";
import { readFile, writeFile } from "../engine/file-operations.js";
import { StatusCodes } from '../protocol/constants.js';
import { log } from '../utils/logger.js';

// Operation types
const Operations = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};


/**
 * Database class for handling CRUD operations on JSON-based file storage
 * 
 * All operations are asynchronous and return a tuple of [data, statusCode].
 * Data is stored in namespace-based JSON files, where each namespace is a collection
 * of records identified by unique IDs.
 * 
 * @class Database
 * 
 * @example
 * const db = new Database();
 * const [newUser, status] = await db.create('users', { name: 'John', email: 'john@example.com' });
 */
export default class Database {
    /**
     * Handle a database operation based on the operation type
     * 
     * @param {string} op - Operation type (CREATE, READ, UPDATE, DELETE)
     * @param {string} ns - Namespace (collection name)
     * @param {string|null} key - Record key/ID (optional for some operations)
     * @param {Object|null} data - Data payload (optional for some operations)
     * @returns {Promise<[any, number]>} Promise resolving to tuple of [result, statusCode]
     * 
     * @example
     * const [result, status] = await db.handle(Operations.READ, 'users', 'user123', null);
     */
    async handle(op, ns, key, data) {
        try {
            // Validate operation type
            if (typeof op !== 'string' || !op) {
                log('WARN', 'Invalid operation type', { op });
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Route to appropriate handler
            switch (op) {
                case Operations.CREATE:
                    log('INFO', 'Create operation', { ns, data });
                    return await this.create(ns, data);
                case Operations.READ:
                    log('INFO', 'Read operation', { ns, key });
                    return await this.read(ns, key);
                case Operations.UPDATE:
                    log('INFO', 'Update operation', { ns, key, data });
                    return await this.update(ns, key, data);
                case Operations.DELETE:
                    log('INFO', 'Delete operation', { ns, key });
                    return await this.delete(ns, key);
                default:
                    log('WARN', 'Unknown operation', { op });
                    return [null, StatusCodes.BAD_REQUEST];
            }
        } catch (error) {
            log('ERROR', '[Database.handle] Unexpected error', { error });
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }
    
    /**
     * Create a new record in the specified namespace
     * 
     * Generates a unique ID for the record and adds it to the namespace's collection.
     * If the namespace doesn't exist, it will be created.
     * 
     * @param {string} ns - Namespace (collection name)
     * @param {Object} data - Record data (without ID, will be auto-generated)
     * @returns {Promise<[Object|null, number]>} Promise resolving to tuple of [newRecord, statusCode]
     * 
     * @throws {Error} If data validation fails or file operation fails
     * 
     * @example
     * const [user, status] = await db.create('users', { name: 'Alice', age: 30 });
     * if (status === StatusCodes.CREATED) {
     *   console.log('Created user with ID:', user.id);
     * }
     */
    async create(ns, data) {
        try {
            if (typeof ns !== 'string' || !ns) {
                log('WARN', 'Invalid namespace for create', { ns });
                return [null, StatusCodes.BAD_REQUEST];
            }
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                log('WARN', 'Invalid data for create', { data });
                return [null, StatusCodes.BAD_REQUEST];
            }
            if (data.id !== undefined) {
                log('WARN', 'ID override attempt in create', { data });
                return [null, StatusCodes.BAD_REQUEST];
            }
            const [existingData, statusCode] = await readFile(ns);
            if (statusCode !== StatusCodes.OK && statusCode !== StatusCodes.NOT_FOUND) {
                log('ERROR', 'Read error in create', { ns, statusCode });
                return [null, statusCode];
            }
            const records = statusCode === StatusCodes.NOT_FOUND ? [] : existingData;
            if (!Array.isArray(records)) {
                log('ERROR', `[Database.create] Expected array`, { ns, type: typeof records });
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            const newRecord = {
                id: generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            records.push(newRecord);
            const [, writeStatus] = await writeFile(ns, records);
            if (writeStatus !== StatusCodes.OK) {
                log('ERROR', 'Write error in create', { ns, writeStatus });
                return [null, writeStatus];
            }
            log('INFO', 'Record created', { ns, newRecord });
            return [newRecord, StatusCodes.CREATED];
        } catch (error) {
            log('ERROR', `[Database.create] Unexpected error`, { ns, error });
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }

    /**
     * Read one or all records from the specified namespace
     * 
     * If key is provided, returns the specific record with that ID.
     * If key is null/undefined, returns all records in the namespace.
     * 
     * @param {string} ns - Namespace (collection name)
     * @param {string|null} key - Record ID (optional, returns all if not provided)
     * @returns {Promise<[Object|Array|null, number]>} Promise resolving to tuple of [record(s), statusCode]
     * 
     * @example
     * // Get all users
     * const [users, status] = await db.read('users', null);
     * 
     * // Get specific user
     * const [user, status] = await db.read('users', 'user123');
     */
    async read(ns, key) {
        try {
            if (typeof ns !== 'string' || !ns) {
                log('WARN', 'Invalid namespace for read', { ns });
                return [null, StatusCodes.BAD_REQUEST];
            }
            const [data, statusCode] = await readFile(ns);
            if (statusCode !== StatusCodes.OK) {
                log('ERROR', 'Read error', { ns, statusCode });
                return [null, statusCode];
            }
            if (!Array.isArray(data)) {
                log('ERROR', `[Database.read] Expected array`, { ns, type: typeof data });
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            if (!key) {
                log('INFO', 'Read all records', { ns, count: data.length });
                return [data, StatusCodes.OK];
            }
            if (typeof key !== 'string') {
                log('WARN', 'Invalid key for read', { key });
                return [null, StatusCodes.BAD_REQUEST];
            }
            const record = data.find(item => item && item.id === key);
            if (!record) {
                log('WARN', 'Record not found', { ns, key });
                return [null, StatusCodes.NOT_FOUND];
            }
            log('INFO', 'Read record', { ns, key });
            return [record, StatusCodes.OK];
        } catch (error) {
            log('ERROR', `[Database.read] Unexpected error`, { ns, error });
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }

    /**
     * Update an existing record in the specified namespace
     * 
     * Finds the record by ID and replaces it with the new data.
     * The original ID is preserved, and createdAt timestamp is maintained.
     * 
     * @param {string} ns - Namespace (collection name)
     * @param {string} key - Record ID to update
     * @param {Object} data - New record data (ID will be ignored if present)
     * @returns {Promise<[Object|null, number]>} Promise resolving to tuple of [updatedRecord, statusCode]
     * 
     * @example
     * const [updated, status] = await db.update('users', 'user123', { name: 'Bob', age: 31 });
     */
    async update(ns, key, data) {
        try {
            if (typeof ns !== 'string' || !ns) {
                log('WARN', 'Invalid namespace for update', { ns });
                return [null, StatusCodes.BAD_REQUEST];
            }
            if (typeof key !== 'string' || !key) {
                log('WARN', 'Invalid key for update', { key });
                return [null, StatusCodes.BAD_REQUEST];
            }
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                log('WARN', 'Invalid data for update', { data });
                return [null, StatusCodes.BAD_REQUEST];
            }
            const [existingData, statusCode] = await readFile(ns);
            if (statusCode !== StatusCodes.OK) {
                log('ERROR', 'Read error in update', { ns, statusCode });
                return [null, statusCode];
            }
            if (!Array.isArray(existingData)) {
                log('ERROR', `[Database.update] Expected array`, { ns, type: typeof existingData });
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            const recordIndex = existingData.findIndex(item => item && item.id === key);
            if (recordIndex === -1) {
                log('WARN', 'Record not found for update', { ns, key });
                return [null, StatusCodes.NOT_FOUND];
            }
            const oldRecord = existingData[recordIndex];
            const updatedRecord = {
                ...data,
                id: key,
                createdAt: oldRecord.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            existingData[recordIndex] = updatedRecord;
            const [, writeStatus] = await writeFile(ns, existingData);
            if (writeStatus !== StatusCodes.OK) {
                log('ERROR', 'Write error in update', { ns, writeStatus });
                return [null, writeStatus];
            }
            log('INFO', 'Record updated', { ns, updatedRecord });
            return [updatedRecord, StatusCodes.OK];
        } catch (error) {
            log('ERROR', `[Database.update] Unexpected error`, { ns, error });
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }

    /**
     * Delete a record from the specified namespace
     * 
     * Finds the record by ID and removes it from the collection.
     * Returns the deleted record for confirmation.
     * 
     * @param {string} ns - Namespace (collection name)
     * @param {string} key - Record ID to delete
     * @returns {Promise<[Object|null, number]>} Promise resolving to tuple of [deletedRecord, statusCode]
     * 
     * @example
     * const [deleted, status] = await db.delete('users', 'user123');
     * if (status === StatusCodes.OK) {
     *   console.log('Deleted user:', deleted);
     * }
     */
    async delete(ns, key) {
        try {
            if (typeof ns !== 'string' || !ns) {
                log('WARN', 'Invalid namespace for delete', { ns });
                return [null, StatusCodes.BAD_REQUEST];
            }
            if (typeof key !== 'string' || !key) {
                log('WARN', 'Invalid key for delete', { key });
                return [null, StatusCodes.BAD_REQUEST];
            }
            const [existingData, statusCode] = await readFile(ns);
            if (statusCode !== StatusCodes.OK) {
                log('ERROR', 'Read error in delete', { ns, statusCode });
                return [null, statusCode];
            }
            if (!Array.isArray(existingData)) {
                log('ERROR', `[Database.delete] Expected array`, { ns, type: typeof existingData });
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            const recordIndex = existingData.findIndex(item => item && item.id === key);
            if (recordIndex === -1) {
                log('WARN', 'Record not found for delete', { ns, key });
                return [null, StatusCodes.NOT_FOUND];
            }
            const deletedRecord = existingData[recordIndex];
            existingData.splice(recordIndex, 1);
            const [, writeStatus] = await writeFile(ns, existingData);
            if (writeStatus !== StatusCodes.OK) {
                log('ERROR', 'Write error in delete', { ns, writeStatus });
                return [null, writeStatus];
            }
            log('INFO', 'Record deleted', { ns, deletedRecord });
            return [deletedRecord, StatusCodes.OK];
        } catch (error) {
            log('ERROR', `[Database.delete] Unexpected error`, { ns, error });
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }
}