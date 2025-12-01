const amqp = require("amqplib");

const QUEUE_NAME = "task_queue";

const consumeMessages = async () => {
    try {
        // 1. Connection and Channel Setup
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();
        
        // Assert the queue to ensure it exists (must match the producer)
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        console.log(`Waiting for messages in ${QUEUE_NAME}. To exit, press CTRL+C`);

        // 2. This tells RabbitMQ not to give more than one message to a worker at a time,
        // ensuring fair distribution if multiple consumers are running.
        channel.prefetch(1);

        // 3. Start Consuming (The Asynchronous Listener)
        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    
                    console.log(" ");
                    console.log(`Received Message: ${content.data}`);
                    
                    // Simulate processing time (e.g., database update, API call)
                    const processingTime = Math.floor(Math.random() * 5000) + 1000; // 1-6 seconds
                    console.log(`Processing task for ${processingTime / 1000} seconds...`);
                    
                    setTimeout(() => {
                        // 4. Acknowledge (ACK) the message
                        // This tells RabbitMQ the message was processed successfully and can be deleted.
                        channel.ack(msg);
                        console.log(`Task finished and acknowledged: ${content.data}`);
                    }, processingTime);

                } catch (e) {
                    console.error("Error processing message:", e.message);
                    // In a real app, you might re-queue the message here (channel.nack)
                    channel.ack(msg); // Acknowledge to avoid re-looping a poison message
                }
            }
        });
    } catch (error) {
        console.error("FATAL: Could not connect to RabbitMQ.", error.message);
        process.exit(1);
    }
};

consumeMessages();