'use strict';

const net = require('net');
const { OutgoingMessage } = require('./pip-outgoing');
const Agent = require('./pip-agent');
const { Buffer} = require('buffer');
const {
  NotImplementedError,
} = require('../internals/errors');
const {
  validateInteger,
  validateString,
  validateBoolean,
} = require('../internals/validators');

/**
 * ClientRequest represents a request sent by the client to the server.
 * @constructor
 */
function ClientRequest() {
  OutgoingMessage.call(this);
}

Object.setPrototypeOf(ClientRequest.prototype, OutgoingMessage.prototype);
Object.setPrototypeOf(ClientRequest, OutgoingMessage);

module.exports = {
    ClientRequest,
};