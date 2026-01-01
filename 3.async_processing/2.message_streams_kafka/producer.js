/**
 * This producer sends a message every second. 
 * By using a unique key for each message, Kafka will automatically spread the messages across all 3 partitions.
 */
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'my-producer', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  let counter = 0;

  setInterval(async () => {
    const message = { 
      key: `user-${counter}`, // Different keys help distribute across partitions
      value: `Order #${counter} at ${new Date().toLocaleTimeString()}` 
    };

    await producer.send({
      topic: 'scaling-demo',
      messages: [message],
    });

    console.log(`Sent: ${message.value} to a partition...`);
    counter++;
  }, 1000);
};

run().catch(console.error);