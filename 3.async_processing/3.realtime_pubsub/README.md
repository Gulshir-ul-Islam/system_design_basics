# Redis Lab: Push-Based Pub/Sub

This project explores the **Push-based Pattern** using Redis. Unlike Kafka, where consumers "pull" data from a persistent log, Redis Pub/Sub works on a "fire-and-forget" principle. It is designed for real-time, high-speed messaging where delivery speed is more critical than message persistence.


## Core Theory: Push vs. Pull

### 1. The "Fire-and-Forget" Mechanism
In Redis Pub/Sub, the broker (Redis) does not store messages. When a publisher sends a message, Redis looks for active connections. If it finds subscribers, it **pushes** the message to them immediately and then deletes the message from memory.

### 2. No Persistence
If a subscriber is offline for even one second, it will miss any messages sent during that window. There is no "offset" or "bookmark" to resume from.

### 3. Fan-out by Default
Redis Pub/Sub does not have "Consumer Groups." Every active subscriber to a channel receives a copy of every message. You cannot "load balance" or split messages between two subscribers on the same channel using this pattern.

## Experiments Conducted

### Experiment 1: Real-time Broadcasting
**Setup:** 1 Publisher + 3 Subscribers.
**Observation:** Every subscriber received the message at the exact same time (sub-millisecond latency). 
**Conclusion:** This is perfect for live chat, real-time notifications, or gaming updates where the latest data is the only data that matters.

### Experiment 2: The "Offline" Loss
**Setup:** Start the publisher. Wait 10 seconds. Start the subscriber.
**Observation:** The subscriber remains empty. It does not see the messages sent during the first 10 seconds.
**Conclusion:** Redis Pub/Sub is **transient**. If you need to ensure every message is processed even after a crash, Kafka (or Redis Streams) is a better choice.

## Practical Real-World Example: Live Score Updates

Imagine a sports app providing live football scores:

* **Channel:** `match-updates-uk-vs-fr`
* **Subscribers:** Thousands of mobile apps currently open on the "Live Scores" screen.
* **Logic:** When a goal is scored, the system publishes a message. Every active app gets a "Push" notification instantly. If a user's phone was off, they don't need the "Live" push; they will just see the final score from a database when they turn it back on.

## Execution Guide

1. **Start Redis:**
   ```bash
   docker run -d --name redis-pubsub -p 6379:6379 redis
   ```

2. **Start Subscribers:**
   Open multiple terminals and run:
   ```bash
   node subscriber.js
   ```

3. **Start Publisher:** In a new terminal, run:
   ```bash
   node publisher.js
   ```

## Cleanup
To stop the container and remove it from your machine:

```bash
docker stop redis-pubsub && docker rm redis-pubsub
```