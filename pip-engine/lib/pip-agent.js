'use strict';

const net = require('net');
const EventEmitter = require('events');
const {
    validateInteger,
    validateString,
} = require('../internals/validators');

/**
 * Agent is responsible for managing connections and sending requests.
 * @constructor
 * @param {Object} options
 */
function Agent(options) {
    EventEmitter.call(this);
}

Object.setPrototypeOf(Agent.prototype, EventEmitter.prototype);
Object.setPrototypeOf(Agent, EventEmitter);

Agent.prototype.createConnection = function createConnection() {
    
};

module.exports = {
    Agent,
};