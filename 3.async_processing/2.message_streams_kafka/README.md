# Kafka Learning Lab: From Queues to Streams

This project documents a hands-on transition from traditional Message Queuing (RabbitMQ/SQS) to **Event Streaming** with Apache Kafka. It demonstrates how Kafka handles horizontal scaling and message persistence using a "Log-centric" architecture.

## Core Theory: The Kafka Shift

### 1. The Distributed Log
Unlike a queue where messages are deleted once consumed, Kafka is an **immutable log**. Messages are appended to the end and stay there until a retention limit (time or size) is reached. This allows multiple consumers to read the same data at different times.

### 2. Partitions & Parallelism
A **Topic** is divided into **Partitions**. This is the secret to Kafka’s performance.
* One partition can only be read by one consumer in a group at a time.
* By having **3 partitions** (set up in `setup.js`), we allow up to 3 consumers to work in parallel.

### 3. Consumer Groups & Offsets
* **Consumer Group:** A label for a "team" of workers. Kafka balances the partitions among members of the same group.
* **Offset:** A "bookmark" (integer) that Kafka stores for each Group/Partition. It tells the consumer where it left off.

## Experiment Log

### Experiment 1: Scaling (Competing Consumers)
**Goal:** Process messages faster by adding workers.
* **Setup:** 1 Producer + 2 Consumers with the **same** `groupId`.
* **Observation:** Kafka performed a "Rebalance." Consumer A was assigned Partition 0 & 1, while Consumer B was assigned Partition 2. They split the work, and no message was processed twice.
* **Key takeaway:** This is how you handle high-traffic ingestion by scaling horizontally.

### Experiment 2: Fan-out (Pub/Sub)
**Goal:** Send the same data to different independent services.
* **Setup:** 1 Producer + 2 Consumers with **different** `groupIds`.
* **Observation:** Both consumers received a full copy of every message. Because they had different IDs, they had their own independent "bookmarks" (offsets).
* **Key takeaway:** This allows one event (like an `OrderPlaced` event) to trigger multiple actions (e.g., Billing, Shipping, and Analytics) simultaneously.

## Execution Guide

1.  **Launch Kafka:**
    ```bash
    docker compose up -d
    ```

2.  **Initialize the Topic:**
    ```bash
    node setup.js
    ```

3.  **Start the Stream:**
    ```bash
    node producer.js
    ```

4.  **Test Scaling:**
    Run `node consumer.js` in two separate terminals using the same `groupId`. Observe how the partition IDs are split between the two windows.

5.  **Test Fan-out:**
    Stop the consumers. Change the `groupId` in one terminal and run both again. Observe how both windows now receive every single message.

---

## Cleanup
To stop the lab and delete the internal data volumes:
```bash
docker compose down -v
```

## Practical Real-World Example: E-Commerce Architecture

To understand why this architecture is so powerful, imagine an e-commerce platform using Kafka to handle new purchases:

### 1. The Topic: `orders`
Every time a customer clicks "Buy," a producer sends a message to the `orders` topic. This is the single "source of truth" for that transaction.

### 2. The Fan-out (Different Group IDs)
We have two distinct microservices that need to react to every order:
* **Group A (`email-service`)**: Reads the `orders` topic to send "Thank You" emails.
* **Group B (`shipping-service`)**: Reads the same `orders` topic to print shipping labels and manifestos.

Because these services have **different Group IDs**, they act independently. If the `email-service` crashes for an hour, it doesn't affect the `shipping-service`. When the `email-service` comes back online, it simply resumes from its last recorded **offset**.

### 3. Scaling (Same Group ID)
Suppose a "Black Friday" sale occurs and the `shipping-service` falls behind because it takes time to generate labels. 
* **The Solution:** You simply spin up a **second instance** of the `shipping-service` using the **same Group ID** (`shipping-service`).
* **The Result:** Kafka automatically detects the new worker and rebalances the partitions. Now, both instances share the load—each processing roughly 50% of the orders—doubling your throughput instantly.