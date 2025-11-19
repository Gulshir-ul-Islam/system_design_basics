# Node.js API with MySQL Master-Replica Setup Guide

This guide details the setup and configuration for a three-container system: a MySQL Master, a MySQL Replica, and a Node.js API service that routes writes to the Master and reads to the Replica.

**NOTE:** The Docker commands are required only if MySQL servers are running as containers. The assumed root password is `1234` (check your `docker-compose.yml` for confirmation).

---

## 1. Database Preparation (Before Running the API)

Before starting the `api-service`, you must ensure the required database and table are present on the Master, so the schema can be replicated to the Replica.

1.  **Verify/Create Database (`sync_test`):** Connect to the Master and ensure the database exists (it should, based on the `MYSQL_DATABASE` environment variable in `docker-compose.yml`).
    ```bash
    docker exec -it mysql-master mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS sync_test;"
    ```

2.  **Create `users` Table:** Create the table that the API will use for CRUD operations.
    ```bash
    docker exec -it mysql-master mysql -u root -p1234 -e "
    USE sync_test;
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );"
    ```
---

## 2. Container Startup and Verification

* Start all services (MySQL Master, MySQL Replica, and API Service):
    ```bash
    docker compose up --build -d
    ```

* Verify the status of all three containers:
    ```bash
    docker compose ps
    ```

* To check container logs (e.g., for the API service):
    ```bash
    docker logs api-service
    ```

---

## 3. Configure MySQL Replication

The connection setup, user creation, and configuration of the Master-Replica link are performed directly inside the database containers.

[Please follow the instructions in the linked file to set up replication.](../commands.md)

---

## 4. API Service (Node.js) Overview

Your **`api-service`** is configured to route traffic based on the request type:

* **Writes (POST, PUT, DELETE):** Connects to the **`mysql-master`** container.
* **Reads (GET):** Connects to the **`mysql-replica`** container.

The API is accessible on your host machine at **`http://localhost:8000`**.

---

## 5. Testing Replication Flow

Follow these steps to verify that the API correctly routes traffic and data syncs between the Master and Replica.

1.  **Test Write (Master via API):** Send a `POST` request to create a new user. The API uses the **Master pool**.
    ```bash
    # Example command (replace with your actual POST data)
    curl -X POST http://localhost:8000/users -H "Content-Type: application/json" -d '{"name": "Alice"}'
    ```
    *Expect:* A successful response (`200` or `201`) confirming the creation via the Master.

2.  **Test Read (Replica via API):** Immediately send a `GET` request for the list of users or the new user's ID. The API uses the **Replica pool**.
    ```bash
    curl http://localhost:8000/users
    ```
    *Expect:* The newly created user ("Alice") should appear in the results, confirming the data replicated from Master to Replica.