# RabbitMQ Asynchronous Consumer (Worker)

This project complements your existing API Producer [API Producer](../1.pushPullBasedMsgBroker) by demonstrating the standard, asynchronous consumption model for RabbitMQ messaging, essential for creating scalable background workers.

## Core Concept: Asynchronous Consumption

Unlike the previous API's synchronous polling (`channel.get`), this consumer uses the **push model** (`channel.consume`). The consumer maintains an open connection, and the RabbitMQ broker **pushes** messages to it instantly as they arrive. This is the recommended pattern for reliable, continuous background processing. 

## Prerequisites

1. **RabbitMQ Broker:** Must be running (e.g., via Docker on `http://localhost:5672`).

2. **Producer Service:** Your API producer must be running to send messages to the `task_queue`.

## Setup and Execution

To see the end-to-end asynchronous flow:

### 1. Start the Consumer

```bash
npm i
node consumer.js
```
# Output: Waiting for messages in task_queue. To exit, press CTRL+C

### 2. Monitor and Produce

With the consumer running, send messages from your API (Producer) [project](../1.pushPullBasedMsgBroker) terminal.

```
Example Request to the Producer API:
curl -X POST http://localhost:3000/messages -H "Content-Type: application/json" -d '{"message": "Process large file upload"}'
```

**Acknowledge (ACK):** After simulating a processing delay (`setTimeout`), the worker explicitly calls `channel.ack(msg)`. This confirms to RabbitMQ that the message was successfully processed and can be safely deleted from the queue. **This is crucial for reliability.**

### Sample Output

You will see the consumer terminal log the receipt, processing, and acknowledgment of the task:
```text
Received Task: Process large file upload
Processing task for 3.5 seconds...
Task finished and acknowledged: Process large file upload
```