import { generateId } from "./utils.js";
import { readFile, writeFile } from "./file-operations.js";
import { StatusCodes, Operations } from './constants.js';

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
     * @param {string} op - Operation type (INSERT, GET, SET, DELETE)
     * @param {string} ns - Namespace (collection name)
     * @param {string|null} key - Record key/ID (optional for some operations)
     * @param {Object|null} data - Data payload (optional for some operations)
     * @returns {Promise<[any, number]>} Promise resolving to tuple of [result, statusCode]
     * 
     * @example
     * const [result, status] = await db.handle(Operations.GET, 'users', 'user123', null);
     */
    async handle(op, ns, key, data) {
        try {
            // Validate operation type
            if (typeof op !== 'string' || !op) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Route to appropriate handler
            switch (op) {
                case Operations.CREATE:
                    return await this.create(ns, data);
                case Operations.READ:
                    return await this.read(ns, key);
                case Operations.UPDATE:
                    return await this.update(ns, key, data);
                case Operations.DELETE:
                    return await this.delete(ns, key);
                default:
                    return [null, StatusCodes.BAD_REQUEST];
            }
        } catch (error) {
            console.error(`[Database.handle] Unexpected error:`, error);
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
            // Validate namespace
            if (typeof ns !== 'string' || !ns) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Validate data
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Prevent ID override
            if (data.id !== undefined) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Read existing data from file (or start with empty array if not found)
            const [existingData, statusCode] = await readFile(ns);
            
            // Handle read errors (except NOT_FOUND which is expected for new namespaces)
            if (statusCode !== StatusCodes.OK && statusCode !== StatusCodes.NOT_FOUND) {
                return [null, statusCode];
            }

            const records = statusCode === StatusCodes.NOT_FOUND ? [] : existingData;
            
            // Validate that records is an array
            if (!Array.isArray(records)) {
                console.error(`[Database.create] Expected array in namespace "${ns}", got ${typeof records}`);
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            
            // Generate unique ID and add to the new record
            const newRecord = {
                id: generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add new record to the array
            records.push(newRecord);
            
            // Write updated data back to file
            const [, writeStatus] = await writeFile(ns, records);
            
            if (writeStatus !== StatusCodes.OK) {
                return [null, writeStatus];
            }
            
            return [newRecord, StatusCodes.CREATED];
        } catch (error) {
            console.error(`[Database.create] Unexpected error in namespace "${ns}":`, error);
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
            // Validate namespace
            if (typeof ns !== 'string' || !ns) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Read data from file
            const [data, statusCode] = await readFile(ns);
            
            if (statusCode !== StatusCodes.OK) {
                return [null, statusCode];
            }
            
            // Validate that data is an array
            if (!Array.isArray(data)) {
                console.error(`[Database.read] Expected array in namespace "${ns}", got ${typeof data}`);
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }

            // If no key provided, return all records
            if (!key) {
                return [data, StatusCodes.OK];
            }

            // Validate key
            if (typeof key !== 'string') {
                return [null, StatusCodes.BAD_REQUEST];
            }
            
            // Find record by ID
            const record = data.find(item => item && item.id === key);
            
            if (!record) {
                return [null, StatusCodes.NOT_FOUND];
            }
            
            return [record, StatusCodes.OK];
        } catch (error) {
            console.error(`[Database.read] Unexpected error in namespace "${ns}":`, error);
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
            // Validate namespace
            if (typeof ns !== 'string' || !ns) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Validate key
            if (typeof key !== 'string' || !key) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Validate data
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Read existing data from file
            const [existingData, statusCode] = await readFile(ns);
            
            if (statusCode !== StatusCodes.OK) {
                return [null, statusCode];
            }
            
            // Validate that existingData is an array
            if (!Array.isArray(existingData)) {
                console.error(`[Database.update] Expected array in namespace "${ns}", got ${typeof existingData}`);
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            
            // Find record by ID
            const recordIndex = existingData.findIndex(item => item && item.id === key);
            
            if (recordIndex === -1) {
                return [null, StatusCodes.NOT_FOUND];
            }

            const oldRecord = existingData[recordIndex];
            
            // Update the record (keep the original ID and createdAt)
            const updatedRecord = {
                ...data,
                id: key,
                createdAt: oldRecord.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            existingData[recordIndex] = updatedRecord;
            
            // Write updated data back to file
            const [, writeStatus] = await writeFile(ns, existingData);
            
            if (writeStatus !== StatusCodes.OK) {
                return [null, writeStatus];
            }
            
            return [updatedRecord, StatusCodes.OK];
        } catch (error) {
            console.error(`[Database.update] Unexpected error in namespace "${ns}":`, error);
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
            // Validate namespace
            if (typeof ns !== 'string' || !ns) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Validate key
            if (typeof key !== 'string' || !key) {
                return [null, StatusCodes.BAD_REQUEST];
            }

            // Read existing data from file
            const [existingData, statusCode] = await readFile(ns);
            
            if (statusCode !== StatusCodes.OK) {
                return [null, statusCode];
            }
            
            // Validate that existingData is an array
            if (!Array.isArray(existingData)) {
                console.error(`[Database.delete] Expected array in namespace "${ns}", got ${typeof existingData}`);
                return [null, StatusCodes.INTERNAL_SERVER_ERROR];
            }
            
            // Find record by ID
            const recordIndex = existingData.findIndex(item => item && item.id === key);
            
            if (recordIndex === -1) {
                return [null, StatusCodes.NOT_FOUND];
            }
            
            // Remove the record
            const deletedRecord = existingData[recordIndex];
            existingData.splice(recordIndex, 1);
            
            // Write updated data back to file
            const [, writeStatus] = await writeFile(ns, existingData);
            
            if (writeStatus !== StatusCodes.OK) {
                return [null, writeStatus];
            }
            
            return [deletedRecord, StatusCodes.OK];
        } catch (error) {
            console.error(`[Database.delete] Unexpected error in namespace "${ns}":`, error);
            return [null, StatusCodes.INTERNAL_SERVER_ERROR];
        }
    }
}