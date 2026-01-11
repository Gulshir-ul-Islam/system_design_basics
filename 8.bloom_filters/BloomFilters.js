const crypto = require('crypto');

class BloomFilter {
    constructor(size) {
        this.size = size;
        // Allocate bytes. e.g., size 8 = 1 byte.
        this.bitArray = Buffer.alloc(Math.ceil(size / 8), 0);
    }

    getHashIndex(item) {
        const hash = crypto.createHash('sha256').update(item).digest('hex');
        // Take a slice of the hash and turn it into a number mapped to our size
        return parseInt(hash.substring(0, 8), 16) % this.size;
    }

    add(item) {
        const index = this.getHashIndex(item);
        const byteIdx = Math.floor(index / 8);
        const bitIdx = index % 8;

        // Use Bitwise OR to flip the specific bit to 1
        this.bitArray[byteIdx] |= (1 << bitIdx);
        console.log(`  > [Debug] "${item}" hashed to index ${index} (Byte ${byteIdx}, Bit ${bitIdx})`);
    }

    isExists(item) {
        const index = this.getHashIndex(item);
        const byteIdx = Math.floor(index / 8);
        const bitIdx = index % 8;

        // Use Bitwise AND to check if the bit is 1
        const isSet = (this.bitArray[byteIdx] & (1 << bitIdx)) !== 0;
        return isSet ? "Probably Yes" : "Definitely No";
    }
}

module.exports = { BloomFilter };