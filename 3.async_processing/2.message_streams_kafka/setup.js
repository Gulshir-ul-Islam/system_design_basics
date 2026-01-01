const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'admin', brokers: ['localhost:9092'] });
const admin = kafka.admin();

const createTopic = async () => {
  await admin.connect();
  await admin.createTopics({
    topics: [{ topic: 'scaling-demo', numPartitions: 3 }],
  });
  console.log("Topic 'scaling-demo' created with 3 partitions.");
  await admin.disconnect();
};

createTopic().catch(console.error);