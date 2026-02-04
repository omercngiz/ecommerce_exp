'use strict';

const { REQUEST, RESPONSE } = require('./frame');

function IncomingMessage() {
    this.buffer = Buffer.alloc(0);
    this.state = 'WAIT_HEADER';
    this.expectedLength = 0;
    this.currentType = null;

    /**
     * TCP'den gelen her chunk burada işlenir
     * @param {Buffer} chunk
     * @returns {Array<{type:number, payload:string}>}
     */
    push(chunk) {
        const messages = [];
        this.buffer = Buffer.concat([this.buffer, chunk]);

        while (true) {
            if (this.state === 'WAIT_HEADER') {
                if (this.buffer.length < 5) break;

                const length = this.buffer.readUInt32BE(0);
                const type = this.buffer.readUInt8(4);

                // validation
                if (length > 1024 * 1024) {
                    throw new Error('FRAME_TOO_LARGE');
                }

                if (type !== REQUEST && type !== RESPONSE) {
                    throw new Error('INVALID_FRAME_TYPE');
                }

                this.expectedLength = length;
                this.currentType = type;

                this.buffer = this.buffer.slice(5);
                this.state = 'WAIT_PAYLOAD';
            }

            if (this.state === 'WAIT_PAYLOAD') {
                if (this.buffer.length < this.expectedLength) break;

                const payloadBuf = this.buffer.slice(0, this.expectedLength);
                this.buffer = this.buffer.slice(this.expectedLength);

                const payload = payloadBuf.toString('utf8');

                messages.push({
                    type: this.currentType,
                    payload,
                });

                // reset
                this.state = 'WAIT_HEADER';
                this.expectedLength = 0;
                this.currentType = null;
            }
        }

        return messages;
    }
}

module.exports = IncomingMessage;
