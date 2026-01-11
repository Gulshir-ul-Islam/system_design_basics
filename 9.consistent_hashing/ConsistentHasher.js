const crypto = require('crypto');

class ConsistentHasher {
    constructor() {
        this.slots = 16; 
        this.ring = []; // Sorted positions
        this.serverMap = new Map(); 
    }

    // Using MD5 to get a uniform distribution
    getHash(key) {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        // Convert first 8 chars of hex to integer and mod by slots
        return parseInt(hash.substring(0, 8), 16) % this.slots;
    }

    addServer(serverName) {
        // In the real world, the server's position is determined by its name/IP hash
        const pos = this.getHash(serverName);
        
        if (this.serverMap.has(pos)) {
            console.log(`⚠️ Collision: ${serverName} hit an occupied slot (${pos}).`);
            return;
        }

        this.ring.push(pos);
        this.ring.sort((a, b) => a - b);
        this.serverMap.set(pos, serverName);
        console.log(`[Ring] ${serverName} placed at slot ${pos}`);
    }

    getServer(key) {
        if (this.ring.length === 0) return null;

        const keyPos = this.getHash(key);
        
        // Find the "Ceiling" (First server >= keyPos)
        let targetPos = this.ring.find(p => p >= keyPos);

        // Wrap Around: If key is past the last server, go to the first server
        if (targetPos === undefined) {
            targetPos = this.ring[0];
        }

        const server = this.serverMap.get(targetPos);
        console.log(`🔍 Key "${key}" (Slot ${keyPos}) -> Assigned to ${server} (Slot ${targetPos})`);
        return server;
    }
}

module.exports = { ConsistentHasher };