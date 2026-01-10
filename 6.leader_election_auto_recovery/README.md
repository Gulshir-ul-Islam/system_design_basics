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

## Architectural Notes

### 1. The Algorithm: How Workers Choose a Leader
In our implementation, we use a **Static Priority "Race" Algorithm** (also known as a simple Distributed Lock).
* **The Mechanism:** Instead of workers voting (like in Raft or Paxos), they compete for a shared resource in Redis.
* **The "First-to-Finish" Rule:** Because Redis is single-threaded, it processes requests one by one. The first worker whose `SET NX` request reaches Redis wins. Redis acts as the **Arbiter**, ensuring that even if two requests arrive at nearly the same microsecond, only one is granted the "Leader" status.
* **Selection Bias:** In this specific model, the "fastest" node (lowest network latency to Redis) or the one whose timer hits zero first after a TTL expiry will always become the new leader.

### 2. A Generic Framework for Auto-Recovery
This is not just for counters; it is a universal pattern for high availability (HA):
* **Database Failover:** Used to promote a Read-Replica to a Primary DB if the master node crashes.
* **Scheduled Jobs (Cron):** Ensures that a "Send Newsletter" job only runs once, even if you have 10 instances of the worker service running.
* **API Gateways:** Appointing a leader to manage dynamic routing tables or SSL certificate renewals.
* **Distributed File Systems:** Choosing a "Name Node" to track where files are stored across hundreds of disks.

**Core Principle:** Whenever a task **must not be duplicated** but **must always be running**, use Leader Election.