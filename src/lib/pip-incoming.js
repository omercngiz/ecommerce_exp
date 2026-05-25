'use strict';

const { Readable, finished } = require('stream');

function readStart(socket) {
  if (socket && !socket._paused && socket.readable)
    socket.resume();
}

function readStop(socket) {
  if (socket)
    socket.pause();
}

/**
 * Abstract base class for ServerRequest and ClientResponse.
 * @param {import("net").Socket} socket 
 */
function IncomingMessage(socket) {
    let streamOptions;
    Readable.call(this, streamOptions);

    this.socket = socket;
    this.complete = false;
}

IncomingMessage.prototype._read = function _read() {

};

IncomingMessage.prototype._destroy = function _destroy() {

};

Object.setPrototypeOf(IncomingMessage.prototype, Readable.prototype);
Object.setPrototypeOf(IncomingMessage, Readable);

module.exports = {
    IncomingMessage,
};
