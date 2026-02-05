'use strict';

const { REQUEST, RESPONSE } = require('./frame');

function IncomingMessage() {
    this.buffer = Buffer.alloc(0);
    this.state = 'WAIT_HEADER';
    this.expectedLength = 0;
    this.currentType = null;
}

/**
 * Reset parser state to initial values
 * Called after successful frame parse or on error
 */
IncomingMessage.prototype.reset = function () {
    this.state = 'WAIT_HEADER';
    this.expectedLength = 0;
    this.currentType = null;
};

/**
 * TCP'den gelen her chunk burada işlenir
 * @param {Buffer} chunk
 * @returns {Array<{type: number|null, payload: string}>}
 */
IncomingMessage.prototype.push = function (chunk) {
    const messages = [];
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
        if (this.state === 'WAIT_HEADER') {
            console.log('[parser] waiting for header');
            if (this.buffer.length < 5) break;

            const length = this.buffer.readUInt32BE(0);
            const type = this.buffer.readUInt8(4);

            if (length > 1024 * 1024) {
                this.reset();
                this.buffer = Buffer.alloc(0);
                throw new Error('FRAME_TOO_LARGE');
            }

            if (type !== REQUEST && type !== RESPONSE) {
                this.reset();
                this.buffer = Buffer.alloc(0);
                throw new Error('INVALID_FRAME_TYPE');
            }

            this.expectedLength = length;
            this.currentType = type;

            this.buffer = this.buffer.subarray(5);
            this.state = 'WAIT_PAYLOAD';
        }

        if (this.state === 'WAIT_PAYLOAD') {
            console.log('[parser] waiting for payload');
            if (this.buffer.length < this.expectedLength) break;

            const payloadBuf = this.buffer.subarray(0, this.expectedLength);
            this.buffer = this.buffer.subarray(this.expectedLength);

            const payload = payloadBuf.toString('utf8');

            this.reset();

            messages.push({
                type: this.currentType,
                payload,
            });
        }
    }
    return messages;
};

module.exports = IncomingMessage;
