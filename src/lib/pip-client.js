'use strict';

const net = require('net');
const { OutgoingMessage } = require('./pip-outgoing');
const { IncomingMessage } = require('./pip-incoming');
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

function tickOnSocketonSocket(req, socket) {
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);
    socket.on('timeout', socketOnTimeout);
};

ClientRequest.prototype.abort = function abort() {

};

ClientRequest.prototype.setTimeout = function setTimeout() {

};

function socketOnData() {

}

function socketOnEnd() {

}

function socketOnError() {
}

function socketOnTimeout() {

}

module.exports = {
    ClientRequest,
};