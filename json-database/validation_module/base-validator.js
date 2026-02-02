/**
 * @fileoverview
 * 
 * Base Validator Class
 * 
 * Provides common validation methods for use in other validator classes.
 * Returns error codes and throws no errors directly.
 * 
 * @module base-validator
 */

export default class BaseValidator {
    /**
     * Validate that a value is a non-empty string
     * 
     * @param {string} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a non-empty string
     */
    validateString(value, fieldName) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new TypeError(`Invalid ${fieldName}: must be a non-empty string.`);
        }
    }

    /**
     * Validate that a value is a number
     * 
     * @param {number} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a valid number
     */
    validateNumber(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new TypeError(`Invalid ${fieldName}: must be a valid number.`);
        }
    }

    /**
     * Validate that a value is a non-null object
     * 
     * @param {Object} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a non-null object
     */
    validateObject(value, fieldName) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new TypeError(`Invalid ${fieldName}: must be a non-null object.`);
        }
    }

    /**
     * Validate that a value is an array
     * 
     * @param {Array<*>} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not an array
     */
    validateArray(value, fieldName) {
        if (!Array.isArray(value)) {
            throw new TypeError(`Invalid ${fieldName}: must be an array.`);
        }
    }

    /**
     * Validate that a value is a boolean
     * 
     * @param {boolean} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a boolean
     */
    validateBoolean(value, fieldName) {
        if (typeof value !== 'boolean') {
            throw new TypeError(`Invalid ${fieldName}: must be a boolean.`);
        }
    }

    /**
     * Validate that a value is a Buffer
     * 
     * @param {Buffer} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a Buffer
     */
    validateBuffer(value, fieldName) {
        if (!Buffer.isBuffer(value)) {
            throw new TypeError(`Invalid ${fieldName}: must be a Buffer.`);
        }
    }

    /**
     * Validate that a value is a function
     * 
     * @param {Function} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @throws {TypeError} If the value is not a function
     */
    validateFunction(value, fieldName) {
        if (typeof value !== 'function') {
            throw new TypeError(`Invalid ${fieldName}: must be a function.`);
        }
    }

    /**
     * Validate that a value is within a specified range
     * 
     * @param {number} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {number} min - Minimum allowed value (inclusive)
     * @param {number} max - Maximum allowed value (inclusive)
     * @throws {TypeError} If the value is not a valid number
     * @throws {RangeError} If the value is outside the specified range
     */
    validateRange(value, fieldName, min, max) {
        this.validateNumber(value, fieldName);
        if (value < min || value > max) {
            throw new RangeError(`Invalid ${fieldName}: must be between ${min} and ${max}.`);
        }
    }

    /**
     * Validate that a value does not exceed a specified ceiling value
     * 
     * @param {number} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {number} ceiling - Maximum allowed value (inclusive)
     * @throws {TypeError} If the value is not a valid number
     * @throws {RangeError} If the value exceeds the ceiling
     */
    validateCeiling(value, fieldName, ceiling) {
        this.validateNumber(value, fieldName);
        if (value > ceiling) {
            throw new RangeError(`Invalid ${fieldName}: must not exceed ${ceiling}.`);
        }
    }

    /**
     * Validate that a value is not below a specified floor value
     * 
     * @param {number} value - The value to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {number} floor - Minimum allowed value (inclusive)
     * @throws {TypeError} If the value is not a valid number
     * @throws {RangeError} If the value is below the floor
     */
    validateFloor(value, fieldName, floor) {
        this.validateNumber(value, fieldName);
        if (value < floor) {
            throw new RangeError(`Invalid ${fieldName}: must be at least ${floor}.`);
        }
    }

    /**
     * Validate that two values are equal using strict equality
     * 
     * @param {*} value1 - First value to compare
     * @param {*} value2 - Second value to compare
     * @param {string} fieldName1 - Name of the first field
     * @param {string} fieldName2 - Name of the second field
     * @throws {Error} If the values are not strictly equal
     */
    validateEquality(value1, value2, fieldName1, fieldName2) {
        if (value1 !== value2) {
            throw new Error(`Invalid values: ${fieldName1} must be equal to ${fieldName2}.`);
        }
    }

    /**
     * Validate that a string does not exceed a specified maximum length
     * 
     * @param {string} value - The string to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {number} maxLength - Maximum allowed length
     * @throws {TypeError} If the value is not a non-empty string
     * @throws {RangeError} If the string length exceeds the maximum
     */
    validateMaxLength(value, fieldName, maxLength) {
        this.validateString(value, fieldName);
        if (value.length > maxLength) {
            throw new RangeError(`Invalid ${fieldName}: length must not exceed ${maxLength} characters.`);
        }
    }

    /**
     * Validate that a string meets a specified minimum length
     * 
     * @param {string} value - The string to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {number} minLength - Minimum required length
     * @throws {TypeError} If the value is not a non-empty string
     * @throws {RangeError} If the string length is below the minimum
     */
    validateMinLength(value, fieldName, minLength) {
        this.validateString(value, fieldName);
        if (value.length < minLength) {
            throw new RangeError(`Invalid ${fieldName}: length must be at least ${minLength} characters.`);
        }
    }

    /**
     * Validate that a string matches a specified pattern
     * 
     * @param {string} value - The string to validate
     * @param {string} fieldName - The name of the field being validated
     * @param {RegExp} pattern - The regular expression pattern to match
     * @param {string} [patternDescription] - Optional description of the pattern for better error messages
     * @throws {TypeError} If the value is not a non-empty string
     * @throws {Error} If the string does not match the pattern
     */
    validatePattern(value, fieldName, pattern, patternDescription) {
        this.validateString(value, fieldName);
        if (!pattern.test(value)) {
            const msg = patternDescription 
                ? `Invalid ${fieldName}: must match ${patternDescription}.`
                : `Invalid ${fieldName}: does not match required pattern.`;
            throw new Error(msg);
        }
    }
}