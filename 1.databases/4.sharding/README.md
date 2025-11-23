# Database Sharding Exercise: Range Partitioning

This project demonstrates a basic implementation of **horizontal partitioning (sharding)** using two separate MySQL database instances. An API service acts as a routing layer, directing read/write requests to the appropriate shard based on a defined sharding key (the user's name).

---

## Exercise Goals

The primary objective is to implement **Range-Based Sharding** for data distribution and intelligent **API Routing** for request handling. 

1.  **Implement Range Sharding:**
    * Deploy two independent MySQL databases (**Shards**).
    * **Shard 1** handles records where the key (name) starts with **'A' through 'M'**.
    * **Shard 2** handles records where the key (name) starts with **'N' through 'Z'**.
2.  **API Routing Layer:**
    * Create an API service that intelligently determines the correct shard for any given request (Insert, Read, Update, Delete) based on the first letter of the user's name.

---

## Implementation: Setup and Execution

The core implementation uses a **Sharding Key-Based Routing Strategy** where the API directs traffic based on simple, pre-defined range partitioning.

### 1. Database Setup (using Docker)

First, run two independent MySQL containers to serve as the database shards.

| Component | Port | Key Range |
| :--- | :--- | :--- |
| **MySQL Shard 1** | `3306` | A-M |
| **MySQL Shard 2** | `3307` | N-Z |

#### 1.1 Start the Shard Containers and Setup Database

Execute the following commands sequentially to set up both MySQL instances, create the database, and create the `users` table on both shards.

```bash
# 1. Start Shard 1 (A-M Range)
docker run --name mysql-shard1 -e MYSQL_ROOT_PASSWORD=1234 -d -p 3306:3306 mysql

# 2. Start Shard 2 (N-Z Range)
docker run --name mysql-shard2 -e MYSQL_ROOT_PASSWORD=1234 -d -p 3307:3306 mysql

# 3. Verify Containers are Running
docker ps
# Check logs for any errors (optional)
# docker logs <container-id>

# 4. Create the 'shard_test' database on both shards
docker exec -it mysql-shard1 mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS shard_test;"
docker exec -it mysql-shard2 mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS shard_test;"

# 5. Create the 'users' table on both servers
docker exec -it mysql-shard1 mysql -u root -p1234 -e "
USE shard_test;
CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(255) PRIMARY KEY,
    city VARCHAR(50)
);"
docker exec -it mysql-shard2 mysql -u root -p1234 -e "
USE shard_test;
CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(255) PRIMARY KEY,
    city VARCHAR(50)
);"
```

### 2. Run Application Service

Start the API routing service (assuming an npm project setup):

```bash
npm start
```

### 3. API Usage Examples (cURL)

Use any HTTP client (like cURL or Postman) to interact with the API on http://localhost:8000. The service will handle the routing logic.

Add User
```bash
curl --location 'http://localhost:8000/users' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Andrew Symonds",
    "city": "Sydney"
}'
```

Get User
```bash
curl --location --request GET 'http://localhost:8000/users/Andrew Symonds' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Andrew Symonds",
    "city": "Sydney"
}'
```

Update User
```bash
curl --location --request PATCH 'http://localhost:8000/users/Andrew Symonds' \
--header 'Content-Type: application/json' \
--data '{
    "city": "Canberra"
}'
```

Delete a User
```bash
curl --location --request DELETE 'http://localhost:8000/users/Andrew Symonds' \
--header 'Content-Type: application/json' \
--data '{
    "city": "Canberra"
}'
```

### 4. Verification: Direct Shard Inspection

To verify that the sharding logic is working correctly and data is truly partitioned, you must log directly into each MySQL server and check the users table content. You should only see data belonging to that shard's assigned range (A-M on Shard 1, N-Z on Shard 2).

#### Check Shard 1 (A-M data only):

```bash
docker exec -it mysql-shard1 mysql -u root -p1234 -e "SELECT * FROM shard_test.users;"
```

#### Check Shard 2 (N-Z data only):

```bash
docker exec -it mysql-shard2 mysql -u root -p1234 -e "SELECT * FROM shard_test.users;"
```