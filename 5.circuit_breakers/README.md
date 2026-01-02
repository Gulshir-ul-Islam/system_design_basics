# Circuit Breaker Lab: Protecting Services from Cascading Failure

This project demonstrates the **Circuit Breaker Pattern** implemented from scratch in Node.js. In a distributed system, if one service (Service B) becomes slow or fails, the calling service (Service A) can quickly exhaust its resources waiting for a response and more requests on the service will result in piling up of the requests, memory consumption increasing etc and finally system crash. The Circuit Breaker prevents this "cascading failure" by stopping requests before they happen.

## Core Theory: The State Machine

A Circuit Breaker acts as a proxy that sits between services and monitors for failures. It operates in three distinct states:

| State | Behavior | Logic |
| :--- | :--- | :--- |
| **🟢 CLOSED** | **Allow Traffic** | Requests flow normally. If a request fails, a counter increases. |
| **🔴 OPEN** | **Block Traffic** | If failures cross a threshold, the "circuit trips." All requests fail **instantly**. |
| **🟡 HALF-OPEN**| **Test Traffic** | After a "sleep window," a few trial requests are allowed through to see if the service recovered. |

## Comparison: System Stability

### Without a Circuit Breaker (The Cascading Failure)
When Service B hangs or becomes slow, the following happens to Service A:
1. **Open Connections:** Every incoming request to Service A starts a new connection to Service B.
2. **Resource Exhaustion:** Service A's memory and worker threads are held hostage by Service B's slow response.
3. **Queue Saturation:** The request queue fills up, and Service A can no longer accept *any* new traffic—even for features that don't depend on Service B.
4. **Crash:** Eventually, Service A crashes due to memory limits or timeout accumulation. One single failing dependency has brought down the entire system.

### With a Circuit Breaker (The Fail-Fast Approach)
1. **Detection:** After 3 failed attempts, the circuit "trips" to **OPEN**.
2. **Immediate Rejection:** Subsequent requests to Service A are rejected instantly. 
3. **Resource Preservation:** Service A does not open any new sockets to the failing Service B, keeping its memory and threads free to serve other healthy features.


## Note on Fallback Responses

When the circuit is **OPEN**, Service A doesn't necessarily have to return a "Hard Error." It can return a **Fallback Response**. This is highly dependent on your application requirements:

* **E-commerce:** If the Recommendation service is down, the fallback could be a static list of "Best Sellers."
* **Social Media:** If the Like-Count service is down, the fallback could be to simply hide the like count or show "0" rather than failing the whole post-load.
* **General:** Returning stale data from a cache is a common fallback strategy to keep the UI functional.


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