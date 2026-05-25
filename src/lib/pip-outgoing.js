'use strict';

const { Stream } = require('stream');

const { REQUEST, RESPONSE } = require('./frame.js');

/**
 * OutgoingMessage is the base class for ClientRequest and ServerResponse.
 * @param {Object} options
 */
function OutgoingMessage(options) {
    Stream.call(this);
    this.outputData = [];

    this.writable = true;
    this._contentLength = null;
    this._hasBody = true;

    this.finished = false;
}

Object.setPrototypeOf(OutgoingMessage.prototype, Stream.prototype);
Object.setPrototypeOf(OutgoingMessage, Stream);

OutgoingMessage.prototype.write = function write(data, encoding, callback) {

};

OutgoingMessage.prototype.end = function end(data, encoding, callback) {

};


module.exports = { 
    OutgoingMessage,
};