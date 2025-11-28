const { connectRedis, client} = require("./client/redisClient");
const { createConnection } = require("./client/mysqlClient");

const DATA_SIZE = 20;
const CACHE_KEY = `products:${DATA_SIZE}`;

let dbConnection = null;

const generateRandomProduct = (id) => {
    return {
        id: id,
        name: `Product-${id}-${Math.floor(Math.random() * 1000)}`,
        price: (Math.random() * 100 + 10).toFixed(2),
        description: `Description for product ${id}.`,
    };
}

const setupAndInsertData = async() => {
    // Check if the connection exists before trying to execute queries
    if (!dbConnection) {
        throw new Error("Database connection is not initialized. Check your connection setup.");
    }

    console.log("Setting up Database and Inserting Data");
    // 1. Create table if not exists
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
            id INT PRIMARY KEY,
            name VARCHAR(255),
            price DECIMAL(10, 2),
            description TEXT
        );
    `;
    await dbConnection.execute(createTableQuery);

    // 2. Clear previous data for a clean benchmark
    await dbConnection.execute('TRUNCATE TABLE products');

    // 3. Generate and insert new data
    const insertQuery = `INSERT INTO products (id, name, price, description) VALUES (?, ?, ?, ?)`;
    const productsToInsert = [];
    for (let i = 1; i <= DATA_SIZE; i++) {
        productsToInsert.push(generateRandomProduct(i));
    }

    const insertPromises = productsToInsert.map(p => 
        dbConnection.execute(insertQuery, [p.id, p.name, p.price, p.description])
    );
    await Promise.all(insertPromises);
    console.log(`Successfully inserted ${DATA_SIZE} random rows in the DB`);
}

const main = async() => {
    try{
        // Setting up DB and insert random data
        dbConnection = await createConnection();
        await setupAndInsertData();

        // Establish redis connection
        await connectRedis();

        // DB SELECT MEASUREMENT
        console.log(`Fetching all ${DATA_SIZE} rows from DB`);
        let startTime = process.hrtime.bigint();
        const [rows] = await dbConnection.execute('SELECT * FROM products');
        let endTime = process.hrtime.bigint();
        
        const dbSelectDurationMs = Number(endTime - startTime) / 1000000;
        productsData = rows;
        console.log(`Data retrieved successfully. Total records: ${productsData.length}`);

        // Set products data into redis cache
        const serializedData = JSON.stringify(productsData);
        await client.set(CACHE_KEY, serializedData);

        console.log(`Retrieving cached data`);
        startTime = process.hrtime.bigint();
        const cachedDataRaw = await client.get(CACHE_KEY);
        endTime = process.hrtime.bigint();

        const cachedDataParsed = JSON.parse(cachedDataRaw);
        const redisGetDurationMs = Number(endTime - startTime) / 1000000;
        console.log(`Retrieved ${cachedDataParsed.length} records from cache`);

        console.log(`DB SELECT Time: ${dbSelectDurationMs.toFixed(3)}ms`);
        console.log(`REDIS GET Time: ${redisGetDurationMs.toFixed(3)}ms`);
    }
    catch (err) {
        console.error(`Error: ${err}`)
    }
    finally {
        try {
            if (dbConnection) await dbConnection.end();
            // Delete the key from Redis
            if (client && client.isOpen) await client.del(CACHE_KEY);
            if (client && client.isOpen) await client.quit();
            console.log(`Cleanup: Key '${CACHE_KEY}' deleted from Redis.`);
        } catch (e) {
            console.error("Cleanup error:", e.message);
        }
    }
};

main();