const redis = require("redis");

const REDIS_URL = 'redis://localhost:6379';

const client = redis.createClient({
    url: REDIS_URL
});

client.on('error', (err) => console.error(`Redis Client Error: ${err}`));

const connectRedis = async() => {
    if(!client.isOpen) {
        try{
            await client.connect();
        console.log("Redis Client: Connection established successfully.");
        } catch (error) {
            console.error("Redis Client: Failed to connect.", error);
        }
    }
}

module.exports = {
    connectRedis,
    client
}