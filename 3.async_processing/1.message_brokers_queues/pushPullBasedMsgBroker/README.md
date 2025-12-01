# RabbitMQ API Producer & Poller - Node.js Exercise

## Exercise Goal: Implementing Push (Send) and Pull (Poll) Messaging

This exercise demonstrates the two primary interaction patterns with a message queue, using a single Node.js API server to manage both operations:

1. **Push Model (Sending):** The `POST /messages` route acts as a **Producer**, accepting requests and asynchronously pushing them onto the RabbitMQ queue.
2. **Pull Model (Polling):** The `GET /messages` route acts as a **Poller**, synchronously pulling the next available message from the queue on demand.

### Basic Use Case

This architecture is fundamental to **decoupling services** and handling **asynchronous tasks**. 

* **Producer Role (POST /messages):** Represents a fast front-end service (e.g., a web application) that needs to quickly accept user input (like a checkout or file upload request) without waiting for the slow work to finish. It queues the job and immediately returns success to the user.
* **Poller Role (GET /messages):** Represents a worker service that cannot continuously listen (like a traditional consumer) but must periodically check the queue for new work (e.g., a batch job scheduler or a system that polls for configuration updates).

## 1. Prerequisites & Setup

### Running the Project

```bash
npm i
npm run start
```
### RabbitMQ Broker

RabbitMQ must be running on `amqp://localhost`. Use Docker to easily start the broker with the management interface:

```bash
docker run -d \
    --hostname my-rabbit \
    --name rabbitmq-broker \
    -p 5672:5672 \
    -p 15672:15672 \
    rabbitmq:3-management
```

| Port | Description |
| :--- | :--- |
| `5672` | Standard AMQP port (for Node.js applications to connect) |
| `15672` | RabbitMQ Management UI (access at `http://localhost:15672`) |

### Management UI Access

You can monitor the queue status, message count, and broker health through the web interface.

1. Navigate to **`http://localhost:15672`** in your browser.
2. Log in using the default credentials: **Username: `guest`**, **Password: `guest`**.
3. Navigate to the **"Queues"** tab to see your `task_queue` and observe the "Ready" count change as you send and pull messages.

## 2. Usage and API Endpoints

### Step 1: Start the Server

After running `npm run start`, the console will confirm the connection to the broker and the API is listening:

```text
Connection established to rabbitMQ
Queue 'task_queue' is asserted (ready).
API Server started at http://localhost:3000
```

### Step 2: Push Messages (Producer - `POST /messages`)

This operation queues a message for eventual processing.

**Request:**

```bash
curl -X POST http://localhost:3000/messages -H "Content-Type: application/json" -d '{"message": "Task 1: Generate sales report."}'
```

**Server Log:**

```text
Sent message to task_queue
```

### Step 3: Pull Messages (Poller - `GET /messages`)

This operation retrieves and consumes (removes) the single next message from the queue.

**Request:**

```bash
curl -X GET http://localhost:3000/messages
```

**Success Response (200 OK):** The message is returned and consumed from the queue.

```json
{
  "message": {
    "data": "Task 1: Generate sales report.",
    "timestamp": 1701540000000 
  }
}
```

**Empty Response (204 No Content):** If the queue is currently empty.

```bash
curl -X GET http://localhost:3000/messages
# (Returns HTTP 204 status code)
```