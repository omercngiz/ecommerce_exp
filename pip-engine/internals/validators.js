/**
 * Validate that a value is an integer.
 * @param {number} value 
 * @param {string} name 
 */
function validateInteger(value, name) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new TypeError(`${name} must be an integer`);
    }
}

/**
 * Validate that a value is a string.
 * @param {string} value 
 * @param {string} name 
 */
function validateString(value, name) {
    if (typeof value !== 'string') {
        throw new TypeError(`${name} must be a string`);
    }
}

/**
 * Validate that a value is a boolean.
 * @param {boolean} value 
 * @param {string} name 
 */
function validateBoolean(value, name) {
    if (typeof value !== 'boolean') {
        throw new TypeError(`${name} must be a boolean`);
    }
}

module.exports = {
    validateInteger,
    validateString,
    validateBoolean,
};