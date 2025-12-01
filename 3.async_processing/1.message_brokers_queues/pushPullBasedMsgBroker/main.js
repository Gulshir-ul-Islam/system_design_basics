const express = require("express");
const { initRabbitMQ, sendMsg, getMsg } = require("./rabbitmqService");

const app = new express();
const PORT = 3000;

app.use(express.json());

app.post("/messages", async (req, res) => {
    return await sendMsg(req, res);
});

app.get("/messages", async (req, res) => {
    const message = await getMsg();
    if(!message) {
        return res.status(204).send();
    }
    return res.status(200).json({
        message
    })
})

/**
 * Main function to start the server: 
 * 1. Initialize RabbitMQ connection.
 * 2. Start listening for HTTP requests.
 */
const startServer = async() => {
    try {
        // Initialize RabbitMQ (must succeed before starting the API)
        await initRabbitMQ();
        
        // Start the Express API server
        app.listen(PORT, () => {
            console.log(`API Server started at http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error("Server failed to start due to RabbitMQ connection error. Exiting.");
        // Exit the process if the core messaging dependency (RabbitMQ) is unavailable
        process.exit(1); 
    }
}

startServer();