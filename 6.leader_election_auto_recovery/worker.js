const Redis = require('ioredis');
const redis = new Redis({ host: 'redis' });

const ID = process.env.HOSTNAME;
const LEASE_KEY = 'leader_key';
const DATA_KEY = 'global_counter';

const TTL = 30;           // Lease lasts 30 seconds
const HEARTBEAT_MS = 10000; // Worker checks/renews every 10 seconds

async function startElection() {
  console.log(`[${ID}] 🔍 Checking status...`);

  // Attempt to claim the "Chair" (The Key)
  const result = await redis.set(LEASE_KEY, ID, 'NX', 'EX', TTL);

  if (result === 'OK') {
    console.log(`[${ID}] 👑 I AM THE NEW LEADER! (Lease acquired for ${TTL}s)`);
    maintainLeadership();
  } else {
    const currentLeader = await redis.get(LEASE_KEY);
    console.log(`[${ID}] 👥 Follower mode. Leader is [${currentLeader}]`);
    
    // Poll every 5 seconds
    setTimeout(startElection, HEARTBEAT_MS);
  }
}

async function maintainLeadership() {
  const heartbeatScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("expire", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  const success = await redis.eval(heartbeatScript, 1, LEASE_KEY, ID, TTL);

  if (success) {
    const newValue = await redis.incr(DATA_KEY);
    console.log(`[${ID}] ⚡ LEADER WORKING. Counter: ${newValue}. Lease renewed for ${TTL}s.`);
    
    setTimeout(maintainLeadership, HEARTBEAT_MS);
  } else {
    console.log(`[${ID}] ❌ LEADERSHIP LOST! Reverting to election...`);
    startElection();
  }
}

console.log(`[${ID}] Worker Online. Election cycle starting...`);
startElection();