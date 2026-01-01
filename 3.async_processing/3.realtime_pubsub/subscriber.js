/**
 * The subscriber sits and waits for Redis to "push" data to it.
 */
const { createClient } = require('redis');

const run = async () => {
  const subscriber = createClient({ url: 'redis://localhost:6379' });
  await subscriber.connect();

  console.log("Waiting for messages...");

  // This is the PUSH mechanism: the callback triggers when data arrives
  await subscriber.subscribe('notifications', (message) => {
    console.log(`Received: ${message}`);
  });
};

run().catch(console.error);