/**
 * This script logs which partition it is reading from. 
 * We use a single groupId so that multiple instances will share the load.
 */
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'my-consumer', brokers: ['localhost:9092'] });
// group ID is for consumer grouping
const consumer = kafka.consumer({ groupId: 'my-scaling-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'scaling-demo', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`[Partition ${partition}] Received: ${message.value.toString()}`);
    },
  });
};

run().catch(console.error);