# Leader Election & Auto-Recovery Lab

This project demonstrates a **Distributed Leader Election** pattern using Node.js and Redis. It solves the problem of ensuring only one service instance (the "Leader") performs a specific task at a time, while providing automatic failover if that instance crashes.

## Core Concepts

### 1. The Distributed Lock (Lease)
In a distributed system, instances are "stateless." We use **Redis** as a shared "Source of Truth." The leader is determined by whichever instance successfully claims a specific key in Redis.

### 2. Atomic Operations
We use the Redis command `SET leader_key ID NX EX TTL`:
* **NX (Not Exists):** Only sets the key if it doesn't already exist. This prevents two leaders.
* **EX (Expiry):** Sets a "Dead Man's Switch." If the leader dies, the key disappears automatically after the TTL.

## System Architecture

* **Redis:** The coordination layer.
* **Worker Nodes (x3):** Identical Docker containers running the election logic.
* **Global Counter:** A shared data point in Redis that only the Leader is allowed to increment.

## Failure Simulation Experiment

### 1. Initial State
When the cluster starts, all workers "race" to Redis. One worker (e.g., `worker-3`) wins the election.
* **Leader:** Performs the task (increments counter) and renews its lease every 5s.
* **Followers:** Check Redis every 5s and wait for the "chair" to become empty.

### 2. The Failure (Manual Intervention)
By running `docker stop <leader_container_id>`, we simulate a hard hardware failure or crash.
* **Observation:** The counter stops immediately.
* **The Wait:** The system remains leaderless for the remainder of the **15s TTL**. This is the detection window.

### 3. Auto-Recovery
Once the TTL expires in Redis, the key is deleted. In the next check cycle, one of the remaining followers (e.g., `worker-2`) successfully claims the key.
* **Result:** Worker 2 is promoted to Leader and resumes the counter from the last known value.


## Execution Guide

1. **Spin up the cluster:**
   ```bash
   docker compose up --build
   ```

2. **Watch the logs:** Observe the heartbeat of the leader and the waiting status of followers.

3. **Kill the Leader:** 
    ```bash
    docker stop <leader_container_id>
    ```

4. **Observe Recovery:** Notice the ~15s pause, followed by a new worker taking over the leadership and the counter.

## Key System Design Lessons

- **MTTR (Mean Time To Recovery):** Controlled by the TTL. Lower TTL = faster recovery; Higher TTL = more stability against network jitters.

- **Mutual Exclusion:** No two nodes ever increment the counter at the same time.

- **Stateful Continuity:** Using a shared database allows the new leader to pick up work exactly where the old one stopped.