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

    this.sockets = [];
    this.requests = [];

    this.maxSockets = 3;
    this.socketTimeout = 0;

}

Object.setPrototypeOf(Agent.prototype, EventEmitter.prototype);
Object.setPrototypeOf(Agent, EventEmitter);

Agent.prototype.createSocket = function createSocket() {

};

Agent.prototype.removeSocket = function removeSocket() {

};

Agent.prototype.socketTimeout = function socketTimeout() {

};

module.exports = {
    Agent,
};