const mysql = require("mysql2/promise");

const MASTER_HOST = process.env.MASTER_HOST || 'mysql-master';
const REPLICA_HOST = process.env.REPLICA_HOST || 'mysql-replica';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234'; // WARNING: Use secrets in production
const DB_DATABASE = process.env.DB_DATABASE || 'sync_test';

//create master connection pool for writes
console.log(`creating master pool to: ${MASTER_HOST}`);
export const masterPool = mysql.createPool({
    host: MASTER_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true
});

//create replica connection pool for reads
/**
 * Note: even though it's mapped to 3307 externally on the host. Since we will run this service as a container,
 * internal container-to-container traffic uses the exposed internal port i.e., 3306 for replica also.
 */
console.log(`creating replica pool to: ${REPLICA_HOST}`);
export const replicaPool = mysql.createPool({
    host: REPLICA_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    waitForConnections: true
});