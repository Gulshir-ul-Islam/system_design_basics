/**
 * The publisher sends a message to a "channel." It doesn't care if anyone is listening.
 */
const { createClient } = require('redis');

const run = async () => {
  const publisher = createClient({ url: 'redis://localhost:6379' });
  await publisher.connect();

  let counter = 0;
  setInterval(async () => {
    const message = `Notification #${counter}`;
    // 'notifications' is the channel name
    await publisher.publish('notifications', message);
    console.log(`Sent: ${message}`);
    counter++;
  }, 1000);
};

run().catch(console.error);