'use strict';

const { REQUEST, RESPONSE } = require('./frame');

function IncomingMessage() {
    this.buffer = Buffer.alloc(0);
    this.state = 'WAIT_HEADER';
    this.expectedLength = 0;
    this.currentType = null;
}

/**
 * TCP'den gelen her chunk burada işlenir
 * @param {Buffer} chunk
 * @returns {Array<{type: number|null, payload: string}>}
 */
IncomingMessage.prototype.push = function(chunk) {
    const messages = [];
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
        if (this.state === 'WAIT_HEADER') {
            // Henüz 5 byte header gelmemişse, daha fazla veri bekle
            if (this.buffer.length < 5) break;

            const length = this.buffer.readUInt32BE(0);
            const type = this.buffer.readUInt8(4);

            // Validation: Frame çok büyükse reddet
            if (length > 1024 * 1024) {
                throw new Error('FRAME_TOO_LARGE');
            }

            // Validation: Sadece REQUEST ve RESPONSE kabul et
            if (type !== REQUEST && type !== RESPONSE) {
                throw new Error('INVALID_FRAME_TYPE');
            }

            this.expectedLength = length;
            this.currentType = type;

            // Header'ı buffer'dan kes
            this.buffer = this.buffer.subarray(5);
            this.state = 'WAIT_PAYLOAD';
        }

        if (this.state === 'WAIT_PAYLOAD') {
            // Henüz tam payload gelmemişse, daha fazla veri bekle
            if (this.buffer.length < this.expectedLength) break;

            // Payload'ı al (header zaten kesildiği için 0'dan başla)
            const payloadBuf = this.buffer.subarray(0, this.expectedLength);
            
            // Payload'ı buffer'dan kes, kalanı sakla
            this.buffer = this.buffer.subarray(this.expectedLength);

            const payload = payloadBuf.toString('utf8');

            messages.push({
                type: this.currentType,
                payload,
            });

            // Bir sonraki frame için reset
            this.state = 'WAIT_HEADER';
            this.expectedLength = 0;
            this.currentType = null;
        }
    }

    return messages;
};

module.exports = IncomingMessage;
