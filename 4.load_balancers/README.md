# Custom Load Balancer: Node.js & Docker

This project demonstrates the internal mechanics of a **Layer 7 (Application Layer) Load Balancer**. By building the proxy logic and health check mechanisms from scratch in Node.js, we explore how traffic is distributed and how high availability is maintained without relying on pre-built tools like Nginx or HAProxy.

## Core Load Balancer Concepts

### 1. Reverse Proxying
The Load Balancer acts as a "middleman." It receives the client's request, selects a backend server, and pipes the request to that server. Once the server responds, the LB pipes the data back to the client.
In real world, every load balancer has either static IP or static DNS name, allowing clients to talk to it. For the end users or external entity, load balancer is the only point of contact, which makes us easy to add as many servers as required to **horizontally** scale without client knowing about it.

### 2. Round Robin Algorithm
We implemented a **Round Robin** strategy to ensure horizontal scaling. The LB maintains a counter and cycles through the list of healthy servers sequentially.
* Request 1 -> Server 1
* Request 2 -> Server 2
* Request 3 -> Server 1 (and so on...)

### 3. Active Health Checks
To prevent sending traffic to a crashed server, the LB performs **Active Health Checks**. Every 5 seconds, it pings the `/health` endpoint of every server. If a server fails to respond, it is removed from the rotation until it passes a health check again.


## Experiments Conducted

### Experiment 1: Traffic Distribution
**Action:** Sent multiple requests to `http://localhost:8080`.

**Result:** The JSON response field `servedBy` toggled between "Server 1" and "Server 2."

**Lesson:** Proved that the Round Robin algorithm effectively shares the load.

### Experiment 2: Failover & Recovery: 
Even if one of the servers crash, it will not take down the whole system. Load Balancer will forward requests to other healthy servers therefore ensuring **Availability**.

**Action:** Ran `docker stop` on one server and monitored the traffic.

**Result:** After the 5-second health check interval, the Load Balancer identified the failure and routed 100% of the traffic to the remaining healthy server.

**Lesson:** Demonstrated how Load Balancers provide **Redundancy** and **High Availability**.

## Execution Guide

1. **Build and Start the Cluster:**
   ```bash
   docker compose up -d --build
   ```

2. **Test the Load Balancer:** Run this loop in the bash terminal to observe the distribution:
    ```bash
    for i in {1..6}; do curl http://localhost:8080/user/$i; echo ""; done
    ```

3. **Verify Health Checks:** Stop a server and watch the LB adjust:
    ```
    docker stop <container_id_of_server1>
    # Wait 5 seconds for health check to trigger
    curl http://localhost:8080/user/123
   ```

## Reference: Alternative Routing Algorithms
While we used Round Robin for its simplicity, production load balancers often use more complex logic depending on the use case:

- **Weighted Round Robin:** Similar to Round Robin, but assigns "weights" to servers (e.g., Server A is 2x stronger than Server B). The LB sends twice as many requests to the stronger server.

- **Least Connections:** The LB tracks how many active requests each server is currently handling. It sends the new request to the server with the fewest active connections.

- **IP Hash (Sticky Sessions):** The LB hashes the client's IP address to ensure that a specific user always lands on the same backend server. This is vital for applications that store session data in local server memory.

## Cleanup
To stop the lab and remove containers:
    ```
    docker compose down
    ```