const { ConsistentHasher } = require('./ConsistentHasher');

const hasher = new ConsistentHasher();

// 1. Place servers based on their name hash
hasher.addServer("Server_A");
hasher.addServer("Server_B");
hasher.addServer("Server_C");

console.log("\n--- Testing Assignments ---");
hasher.getServer("user-key-11");
hasher.getServer("user-key-23");
hasher.getServer("user-key-37");

// 2. Scale up
hasher.addServer("Server_D");

console.log("\n--- Testing Assignments ---");
hasher.getServer("user-key-11");
hasher.getServer("user-key-23");
hasher.getServer("user-key-37");