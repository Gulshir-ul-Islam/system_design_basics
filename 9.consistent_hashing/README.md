# Consistent Hashing Lab (16-Slot Ring)

This project demonstrates **Consistent Hashing**, a fundamental algorithm used in distributed systems (like DynamoDB, Cassandra, and Memcached) to minimize data migration when scaling clusters.

## The Core Logic
Instead of using `hash(key) % N`, which breaks every time $N$ changes, Consistent Hashing maps both **Servers** and **Data Keys** onto a circular "Hash Ring."

1. **Mapping:** Servers are hashed to specific slots on the ring.
2. **Clockwise Rule:** To find a key's server, find its position on the ring and travel **clockwise** until you hit the first server.
3. **Wrap Around:** If a key's position is past the last server, it wraps around to the first server on the ring.

## Observation: Minimal Data Movement
In this lab, I used a **16-slot ring (0-15)** to track how keys move when a 4th server is added to a 3-server cluster.

### Phase 1: 3 Servers Active
* **Server_A** @ Slot 6
* **Server_B** @ Slot 12
* **Server_C** @ Slot 15

**Initial Assignments:**
* Key `user-key-11` (Slot 8) -> Assigned to **Server_B** (Next $\ge$ 8 is 12)
* Key `user-key-23` (Slot 1) -> Assigned to **Server_A** (Next $\ge$ 1 is 6)
* Key `user-key-37` (Slot 13) -> Assigned to **Server_C** (Next $\ge$ 13 is 15)


### Phase 2: Adding Server_D @ Slot 3
I introduced **Server_D** into the cluster. Notice that only **one** key changed its location:

| Key | Hash Slot | Previous | New Assignment | Status |
| :--- | :--- | :--- | :--- | :--- |
| `user-key-11` | 8 | Server_B | **Server_B** | ✅ Unchanged |
| `user-key-23` | 1 | Server_A | **Server_D** | 🔄 **RE-MAPPED** |
| `user-key-37` | 13 | Server_C | **Server_C** | ✅ Unchanged |



**Why did `user-key-23` move?**
Its hash slot is **1**. Previously, the next server clockwise was **Server_A** (at 6). After adding **Server_D** (at 3), Server_D became the first server encountered clockwise.

**The Win:** In a traditional hashing system, adding a 4th server would likely have forced **all three** keys to move. Here, only the data belonging to the new server's range was affected.

## System Design Benefits
* **Scalability:** You can add or remove nodes with minimal impact on the existing data distribution.
* **Stateless vs Stateful:** While stateless servers don't need this, it is **critical** for stateful systems (Caches/Databases) to prevent "Cache Stampedes" or massive DB re-sharding.

## Technical Implementation
* **Hash Function:** `MD5` (truncated) to ensure a uniform distribution even in a small 16-slot space.
* **Data Structure:** A sorted array (`ring`) for positions and a `Map` for server lookups.
* **Complexity:** $O(N)$ for lookups in this lab, but $O(\log N)$ in production using Binary Search.

### How to Run
1. `node main.js`