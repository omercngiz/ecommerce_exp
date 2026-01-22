import { generateId } from "./utils";
import { readFile, writeFile } from "./file-operations.js";
import { StatusCodes } from './constants.js';


export default class Database {
    handle(op, ns, key, data) {
        switch (op) {
            case 'CREATE':
                return this.create(ns, data);
            case 'READ':
                return this.read(ns, key);
            case 'UPDATE':
                return this.update(ns, key, data);
            case 'DELETE':
                return this.delete(ns, key);
            default:
                return [null, StatusCodes.BAD_REQUEST];
        }
    }
    
    create(ns, data) {
        // Read existing data from file (or start with empty array if not found)
        const [existingData, statusCode] = readFile(ns);
        const records = statusCode === StatusCodes.NOT_FOUND ? [] : existingData;
        
        // Generate unique ID and add to the new record
        const newRecord = {
            id: generateId(),
            ...data
        };
        
        // Add new record to the array
        records.push(newRecord);
        
        // Write updated data back to file
        const [, writeStatus] = writeFile(ns, records);
        
        if (writeStatus !== StatusCodes.OK) {
            return [null, writeStatus];
        }
        
        return [newRecord, StatusCodes.CREATED];
    }

    read(ns, key) {
        // Read data from file
        const [data, statusCode] = readFile(ns);
        
        if (statusCode !== StatusCodes.OK) {
            return [null, statusCode];
        }
        
        // If no key provided, return all records
        if (!key) {
            return [data, StatusCodes.OK];
        }
        
        // Find record by ID
        const record = data.find(item => item.id === key);
        
        if (!record) {
            return [null, StatusCodes.NOT_FOUND];
        }
        
        return [record, StatusCodes.OK];
    }

    update(ns, key, data) {
        // Read existing data from file
        const [existingData, statusCode] = readFile(ns);
        
        if (statusCode !== StatusCodes.OK) {
            return [null, statusCode];
        }
        
        // Find record by ID
        const recordIndex = existingData.findIndex(item => item.id === key);
        
        if (recordIndex === -1) {
            return [null, StatusCodes.NOT_FOUND];
        }
        
        // Update the record (keep the original ID)
        const updatedRecord = {
            id: key,
            ...data
        };
        
        existingData[recordIndex] = updatedRecord;
        
        // Write updated data back to file
        const [, writeStatus] = writeFile(ns, existingData);
        
        if (writeStatus !== StatusCodes.OK) {
            return [null, writeStatus];
        }
        
        return [updatedRecord, StatusCodes.OK];
    }

    delete(ns, key) {
        // Read existing data from file
        const [existingData, statusCode] = readFile(ns);
        
        if (statusCode !== StatusCodes.OK) {
            return [null, statusCode];
        }
        
        // Find record by ID
        const recordIndex = existingData.findIndex(item => item.id === key);
        
        if (recordIndex === -1) {
            return [null, StatusCodes.NOT_FOUND];
        }
        
        // Remove the record
        const deletedRecord = existingData[recordIndex];
        existingData.splice(recordIndex, 1);
        
        // Write updated data back to file
        const [, writeStatus] = writeFile(ns, existingData);
        
        if (writeStatus !== StatusCodes.OK) {
            return [null, writeStatus];
        }
        
        return [deletedRecord, StatusCodes.OK];
    }
}