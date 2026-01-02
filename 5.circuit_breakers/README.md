# Circuit Breaker Lab: Protecting Services from Cascading Failure

This project demonstrates the **Circuit Breaker Pattern** implemented from scratch in Node.js. In a distributed system, if one service (Service B) becomes slow or fails, the calling service (Service A) can quickly exhaust its resources waiting for a response and more requests on the service will result in piling up of the requests, memory consumption increasing etc and finally system crash. The Circuit Breaker prevents this "cascading failure" by stopping requests before they happen.

## Core Theory: The State Machine

A Circuit Breaker acts as a proxy that sits between services and monitors for failures. It operates in three distinct states:

| State | Behavior | Logic |
| :--- | :--- | :--- |
| **🟢 CLOSED** | **Allow Traffic** | Requests flow normally. If a request fails, a counter increases. |
| **🔴 OPEN** | **Block Traffic** | If failures cross a threshold, the "circuit trips." All requests fail **instantly**. |
| **🟡 HALF-OPEN**| **Test Traffic** | After a "sleep window," a few trial requests are allowed through to see if the service recovered. |


### Why use this?
1.  **Fail Fast:** Instead of making a user wait 30 seconds for a timeout, return an error in milliseconds.
2.  **Resource Preservation:** Prevents your server from hanging on to open sockets for requests doomed to fail.
3.  **Self-Healing:** Gives the struggling downstream service "space" to recover without being hammered.


## Experiments Conducted

### Experiment 1: The Trip (Closed -> Open)
**Action:** Sent 3 requests to Service A while Service B was slow.

**Observation:**
* Requests 1-3: Delayed for 1 second each (timeout) before returning a "Fallback."
* Request 4+: Failed **instantly** with the message: `Circuit is OPEN`.

**Conclusion:** The breaker identified the pattern and protected Service A from waiting on the slow Service B.

### Experiment 2: The Recovery (Open -> Half-Open -> Closed)
**Action:** Waited 10 seconds (the sleep window) and sent another request.

**Observation:**
* The breaker moved to **HALF-OPEN** and allowed one request through.
* If that request succeeded, the breaker moved back to **CLOSED**.

## Execution Guide

1. **Start the Flaky Service (Service B):**
   ```bash
   node serviceB.js
   ```

2. **Start the Protected Service (Service A):**
    ```bash
    node serviceA.js
    ```

3. **Test the "Fail Fast" Mechanism: Run this multiple times to see the transition from timeout delay to instant failure:**
    ```bash
    curl http://localhost:3000
    ```