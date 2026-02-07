'use strict';

const net = require('net');
const { OutgoingMessage, REQUEST, RESPONSE } = require('./pip-outgoing');
const Agent = require('./pip-agent');
const { Buffer} = require('buffer');
const {
  ConnResetException,
  ERR_INVALID_ARG_TYPE,
  ERR_INVALIN_PIP_TOKEN,
} = require('../internals/errors');
const {
  validateInteger,
  validateString,
  validateBoolean,
} = require('../internals/validators');

function ClientRequest() {
  OutgoingMessage.call(this);
}