const mysql = require("mysql2/promise");

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASSWORD = '1234'; // WARNING: Use secrets in production
const DB_DATABASE = 'test';

exports.createConnection = async () => {
    try {
        console.log(`[MySQL] Attempting connection to host: ${DB_HOST}`);
        
        // This line creates the actual connection object
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_DATABASE,
            waitForConnections: true
        });
        
        console.log("[MySQL] Connection established successfully.");
        return connection;
    } catch (error) {
        console.error(`[MySQL] Failed to connect: ${error.message}`);
        throw error;
    }
}