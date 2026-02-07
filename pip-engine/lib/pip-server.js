'use strict';

const net = require('net');
const IncomingMessage = require('./pip-incoming.js');
const { OutgoingMessage } = require('./pip-outgoing.js');
const EventEmitter = require('events');
const {
    validateInteger,
    validateString,
} = require('../internals/validators');
const {
    NotImplementedError,
} = require('../internals/errors');
const STATUS_CODES = {
    100: 'Continue',
    102: 'Processing',
    200: 'OK',
    201: 'Created',
    202: 'Accepted'
};

/**
 * ServerResponse represents a response sent by the server to the client.
 * @constructor
 * @param {ClientRequest?} request
 * @param {Object} options
 */
function ServerResponse(request, options) {
    OutgoingMessage.call(this, options);
}

Object.setPrototypeOf(ServerResponse.prototype, OutgoingMessage.prototype);
Object.setPrototypeOf(ServerResponse, OutgoingMessage);

/**
 * 
 * @param {Object} options 
 * @param {} requestListener 
 * @returns {net.Server|undefined}
 */
function Server(options, requestListener) {
    if(!(this instanceof Server)) {
        return new net.Server(options, requestListener);
    }
}

Object.setPrototypeOf(Server.prototype, net.Server.prototype);
Object.setPrototypeOf(Server, net.Server);

module.exports = {
    Server,
    ServerResponse,
    STATUS_CODES,
};