# Redis vs. MySQL Performance Benchmark

This project is a simple Node.js benchmark designed to demonstrate the massive difference in read latency between retrieving data from a traditional disk-based relational database (MySQL) and an in-memory data store (Redis).

## The Exercise

**Objective:** Measure and compare the time taken to retrieve 20 simple product records from:

1. **MySQL:** A database query (SELECT).

2. **Redis:** A cache lookup (GET).

The results clearly illustrate why caching is an essential scaling technique for modern high-performance applications.

## Setup Instructions

### Step 1: Start Containers

Use Docker to quickly spin up local instances of Redis and MySQL.

1. Start Redis on port 6379 (used for caching)
```bash
docker run -d --name cache-redis -p 6379:6379 redis
```

2. Start MySQL on port 3306 (used for persistence)
NOTE: The root password '1234' is used here, matching the client configuration.
```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=1234 mysql
```
### Step 2: Create database `test`

```bash
docker exec -it mysql mysql -u root -p1234 -e "CREATE DATABASE IF NOT EXISTS test;"
```

### Step 3: Install Dependencies

Navigate to your project directory and install the required Node.js libraries.

```bash
npm install
```

### Step 4: Run the Benchmark

The main script handles all logic: database creation, table setup, data insertion, and time measurement.

```bash
node redisVsDbTest.js
```

## Expected Output (Example)

When you run the script, you will see output similar to this, demonstrating the speed differences:

```
[MySQL] Attempting connection to host: localhost
[MySQL] Connection established successfully.
Setting up Database and Inserting Data
Successfully inserted 20 random rows in the DB
Redis Client: Connection established successfully.
Fetching all 20 rows from DB
Data retrieved successfully. Total records: 20
Retrieving cached data
Retrieved 20 records from cache
DB SELECT Time: 6.043ms
REDIS GET Time: 1.126ms
Cleanup: Key 'products:20' deleted from Redis.
```

(Note: Actual times will vary based on your machine and network.)

## Cleanup

To stop and remove the containers after you are done:

```bash
docker stop cache-redis mysql
docker rm cache-redis mysql
```