# 🚀 MySQL Master-Replica Replication Setup Guide

**NOTE:** The Docker commands are required only if MySQL servers are run as containers. The assumed root password is `1234` (check your `docker-compose.yml`).

---

## 1. Container Startup and Verification

* Start the containers:
    ```bash
    docker compose up -d
    ```

* Verify status of both the containers:
    ```bash
    docker compose ps
    ```

* To check container logs:
    ```bash
    docker logs <container-id>
    ```

* If a container is in an exited state, check using the command:
    ```bash
    docker ps -la
    ```

The containers are running, but replication hasn't been set up yet. You need to connect to the master and replica to execute the necessary MySQL commands.

---

## 2. Master Configuration

1.  **Connect to Master:** Connect directly to the MySQL session.
    ```bash
    docker exec -it mysql-master mysql -u root -p1234
    ```

2.  **Create Replication User & Fix Auth:** Execute the following SQL commands in the MySQL session:
    ```sql
    CREATE USER 'repl_user'@'%' IDENTIFIED BY 'repl_password';
    GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
    -- FIX: change authentication plugin for compatibility (avoids "requires secure connection" error)
    ALTER USER 'repl_user'@'%' IDENTIFIED WITH mysql_native_password BY 'repl_password';
    FLUSH PRIVILEGES;
    ```

3.  **Get the Master's Status:**
    ```sql
    SHOW MASTER STATUS;
    ```
    **NOTE:** Note the values for **`File`** (e.g., `mysql-bin.000003`) and **`Position`** (e.g., `157`). You will need these in the next step.

---

## 3. Replica Configuration

1.  **Connect to Replica:** Connect directly to the MySQL session on the replica.
    ```bash
    docker exec -it mysql-replica mysql -u root -p1234
    ```

2.  **Configure Replica:** Execute the `CHANGE REPLICATION SOURCE TO` command, replacing the placeholders with the values you noted from the master:
    ```sql
    CHANGE REPLICATION SOURCE TO 
      SOURCE_HOST='mysql-master', 
      SOURCE_USER='repl_user', 
      SOURCE_PASSWORD='repl_password', 
      SOURCE_LOG_FILE='<MASTER_LOG_FILE>',  -- Replace with your File value
      SOURCE_LOG_POS=<MASTER_LOG_POSITION>; -- Replace with your Position value

    START REPLICA;
    ```

---

## 4. Fix and Verification

1.  **Fix the SQL Thread Error (Skipping the Transaction):** If the SQL thread immediately stops (due to the replica trying to re-execute the user creation command, Error 1396), use these commands on the Replica prompt to skip the failed transaction:
    ```sql
    STOP REPLICA SQL_THREAD;

    -- Skip the single failing transaction
    SET GLOBAL sql_replica_skip_counter = 1; 

    START REPLICA;
    ```

2.  **Check the Final Replication Status:** Execute this on the Replica prompt:
    ```sql
    SHOW REPLICA STATUS\G
    ```
    **SUCCESS CRITERIA:** Look for these critical lines to confirm success:
    * `Replica_IO_Running: Yes`
    * `Replica_SQL_Running: Yes`
    * `Replica_IO_State: Waiting for source to send event`

---

## 5. Testing Replication

Follow these steps to ensure data written to the Master successfully syncs to the Replica.

1.  **Connect to Master and Insert Data:** Connect to the Master and create a test table and a record.
    ```bash
    docker exec -it mysql-master mysql -u root -p1234
    ```
    ```sql
    USE sync_test;
    CREATE TABLE test_data (id INT PRIMARY KEY, value VARCHAR(50));
    INSERT INTO test_data VALUES (1, 'Hello from Master');
    EXIT;
    ```

2.  **Connect to Replica and Verify Data:** Connect to the Replica and check if the inserted data is present.
    ```bash
    docker exec -it mysql-replica mysql -u root -p1234
    ```
    ```sql
    USE sync_test;
    SELECT * FROM test_data;
    EXIT;
    ```
    The output should show the record: `| 1 | Hello from Master |`.

**You now have a functional Master-Replica setup ready for testing!**