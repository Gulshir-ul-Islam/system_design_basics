const amqp = require("amqplib");

const QUEUE_NAME = "task_queue";

let channel = null;
let connection = null;

const initRabbitMQ = async () => {
    try {
        // 1. Establish connection to RabbitMQ server
        connection = await amqp.connect("amqp://localhost");
        console.log("Connection established to rabbitMQ");

        // 2. Create a channel
        channel = await connection.createChannel();

        // 3. Assert a queue: this ensures the queue exists before we try to send to it
        // 'durable: true' makes the queue survive a RabbitMQ server restart.
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        console.log(`Queue '${QUEUE_NAME}' is asserted (ready).`);
    } catch (error) {
        console.log(`Error while establishing a connection to the rabbitmq`);
        // throwing error as this is fatal.
        // In a real application, you would implement a retry mechanism here
        throw error;
    }
}

const sendMsg = async (req, res) => {
    const { message } = req.body;
    if(!message) {
        res.status(400).json("Requires a message");
    }
    try {
        // Send the message to the queue
        // 'persistent: true' marks the message as persistent, meaning RabbitMQ will 
        // try to save it to disk if the server shuts down (requires a durable queue).
        const msg = {
            data: message,
            timestamp: Date.now()
        }
        const sent = channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(msg)), {
            persistent: true
        });

        if(sent) {
            console.log(`Sent message to ${QUEUE_NAME}`);
        } else {
            console.log(`Failed to send a message`);
        }
        res.status(201).json("success");
    } catch (error) {
        console.log(`Error in Producer: ${error}`);
        res.status(500).json("Internal server error. Please try after some time.")
    }
}

module.exports = {
    initRabbitMQ,
    sendMsg
}