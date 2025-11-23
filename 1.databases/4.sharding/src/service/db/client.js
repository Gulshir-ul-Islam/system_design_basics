const mysql = require("mysql2/promise");

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234'; // WARNING: Use secrets in production
const DB_DATABASE = process.env.DB_DATABASE || 'shard_test';

console.log(`Creating connection pool with Shard1`);
exports.shard1Pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true,
});

console.log(`Creating connection pool with Shard2`);
exports.shard2Pool = mysql.createPool({
    host: "localhost",
    port: 3307,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true
});