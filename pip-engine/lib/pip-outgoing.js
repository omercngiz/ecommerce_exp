'use strict';

const { REQUEST, RESPONSE } = require('./frame.js');

/**
 * OutgoingMessage is the base class for ClientRequest and ServerResponse.
 * @param {Object} options
 */
function OutgoingMessage(options) {

}

module.exports = { 
    OutgoingMessage,
};