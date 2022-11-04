const crypto = require("node:crypto");

/**
 * 
 * @param {number} num 
 * @returns {number[]} The byte representation of the number
 */
function intToBytes(num) {
    var bytes = [];

    for (var i = 7; i >= 0; --i) {
        bytes[i] = num & (255);
        num = num >> 8;
    }

    return bytes;
}

/**
 * 
 * @param {string} hex 
 * @returns {number[]} The bytes the hex string is made up of
 */
function hexToBytes(hex) {
    var bytes = [];
    for (var c = 0, C = hex.length; c < C; c += 2) {
        bytes.push(parseInt(hex.substring(c, 2), 16));
    }
    return bytes;
}

/**
 * 
 * @param {string} secret The pre-shared secret key for generating the OTP
 * 
 * @param {Date} epoch
 *      Date representing epoch offset 
 *      This is used for generating the Token counter (basically the time seed)
 * 
 * @param {number} step How many seconds it takes for a new code to generate
 * 
 * @returns {string} The generated One-Time-Password
 */
module.exports = async function generateTOTP(secret, epoch = Date.now(), step = 30) {
    let counter = Math.floor(epoch / step / 1000);

    var p = 6;
    var b = intToBytes(counter);

    var hmac = crypto.createHmac('sha1', Buffer.from(secret));

    var digest = hmac.update(Buffer.from(b)).digest('hex');

    var h = hexToBytes(digest);

    // Truncate
    var offset = h[19] & 0xf;
    var v = (h[offset] & 0x7f) << 24 |
        (h[offset + 1] & 0xff) << 16 |
        (h[offset + 2] & 0xff) << 8 |
        (h[offset + 3] & 0xff);

    v = (v % 1000000) + '';

    return Array(7 - v.length).join('0') + v;
}