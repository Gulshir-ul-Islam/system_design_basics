# Real-Time Bi-Directional Communication Lab (Socket.io)

This project explores the shift from traditional Request-Response (HTTP) to persistent, full-duplex communication using **WebSockets** via the **Socket.io** library.

## Core Concepts

### 1. HTTP vs. WebSockets
* **HTTP (Stateless):** The client must initiate every request. To get updates, the client must "poll" the server repeatedly.
* **WebSockets (Stateful):** Starts with an HTTP "Upgrade" handshake, then maintains a single persistent TCP connection. Both Server and Client can push data to each other at any time.

### 2. Event-Driven Architecture
Instead of traditional endpoints (`/get-messages`), we use **Events**.
* `emit`: Sending an event with a data payload.
* `on`: Listening for an event and executing a callback.
* `broadcast`: The server sending data to everyone *except* the original sender.


## System Architecture

* **Chat Server:** A central hub that manages active WebSocket connections.
* **Chat Workers (x3):** Client replicas that simulate real-time users.
* **Network:** All containers reside on a custom Docker bridge network to allow DNS resolution via service names.

## Observation Steps

### 1. The Handshake
When you run `docker compose up`, observe the server logs. You will see the **HTTP Upgrade** happen as each client establishes a long-lived connection.

### 2. Real-Time Broadcasting
Notice that when one worker emits a `chat_message`:
1.  The server receives it.
2.  The server uses `socket.broadcast.emit`.
3.  The other two workers log the message **instantly** without refreshing or polling.

### 3. Server-Side Filtering
The logic ensures that the sender does not receive their own message back, reducing unnecessary network traffic and client-side processing.

## Quick Start

1.  **Build and Run:**
    ```bash
    docker compose up --build
    ```

2.  **Scale Workers (Optional):**
    If you want to see more users join the "chat":
    ```bash
    docker compose up --scale chat-worker=5
    ```

## Key Learning Summary
WebSockets are the gold standard for high-frequency, low-latency applications like:
* Real-time chat & collaboration tools.
* Live financial tickers/stock prices.
* Multiplayer gaming state synchronization.
* Live dashboards and monitoring.