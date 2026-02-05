'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Central Environment Configuration Manager
 * Loads .env files from each module directory
 */
class EnvConfig {
    constructor() {
        this.rootDir = __dirname;
        
        // Module paths relative to root
        this.modules = {
            BACKEND: path.join(this.rootDir, 'backend'),
            FRONTEND: path.join(this.rootDir, 'frontend'),
            FAKE_BANK_API: path.join(this.rootDir, 'fake-bank-api'),
            JSON_DATABASE: path.join(this.rootDir, 'json-database'),
            PIP_ENGINE: path.join(this.rootDir, 'pip-engine'),
            TRAIN: path.join(this.rootDir, 'train'),
        };

        // Cache for loaded environments
        this.cache = {};
    }

    /**
     * Load and parse .env file from a specific module
     * @param {string} moduleName - Name of the module (e.g., 'BACKEND')
     * @returns {Object} Parsed environment variables
     */
    loadModuleEnv(moduleName) {
        if (this.cache[moduleName]) {
            return this.cache[moduleName];
        }

        const modulePath = this.modules[moduleName];
        if (!modulePath) {
            throw new Error(`Unknown module: ${moduleName}`);
        }

        const envPath = path.join(modulePath, '.env');
        
        if (!fs.existsSync(envPath)) {
            console.warn(`[EnvConfig] .env file not found for ${moduleName} at ${envPath}`);
            this.cache[moduleName] = {};
            return {};
        }

        try {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const parsed = this.parseEnv(envContent);
            this.cache[moduleName] = parsed;
            return parsed;
        } catch (error) {
            throw new Error(`Failed to load .env for ${moduleName}: ${error.message}`);
        }
    }

    /**
     * Parse .env file content
     * @param {string} content - Content of .env file
     * @returns {Object} Parsed key-value pairs
     */
    parseEnv(content) {
        const result = {};
        const lines = content.split('\n');

        for (const line of lines) {
            // Skip empty lines and comments
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }

            // Parse KEY=VALUE or KEY = VALUE
            const match = trimmed.match(/^([^=]+?)\s*=\s*(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();

                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Get environment variable from specific module
     * @param {string} moduleName - Name of the module
     * @param {string} key - Environment variable key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Environment variable value
     */
    get(moduleName, key, defaultValue = undefined) {
        const env = this.loadModuleEnv(moduleName);
        return env[key] !== undefined ? env[key] : defaultValue;
    }

    /**
     * Get all environment variables for a module
     * @param {string} moduleName - Name of the module
     * @returns {Object} All environment variables
     */
    getAll(moduleName) {
        return this.loadModuleEnv(moduleName);
    }

    /**
     * Get module path
     * @param {string} moduleName - Name of the module
     * @returns {string} Absolute path to module
     */
    getModulePath(moduleName) {
        const modulePath = this.modules[moduleName];
        if (!modulePath) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        return modulePath;
    }

    /**
     * Clear cache for specific module or all modules
     * @param {string} [moduleName] - Optional module name to clear
     */
    clearCache(moduleName = null) {
        if (moduleName) {
            delete this.cache[moduleName];
        } else {
            this.cache = {};
        }
    }

    /**
     * Check if module exists
     * @param {string} moduleName - Name of the module
     * @returns {boolean}
     */
    hasModule(moduleName) {
        return this.modules[moduleName] !== undefined;
    }

    /**
     * List all available modules
     * @returns {string[]} Array of module names
     */
    listModules() {
        return Object.keys(this.modules);
    }
}

// Export singleton instance
module.exports = new EnvConfig();
