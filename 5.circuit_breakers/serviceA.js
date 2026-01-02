/**
 * This service calls Service B but protects itself with our CircuitBreaker.
 */

const http = require('http');
const CircuitBreaker = require('./CircuitBreaker');

// A simple fetch function that times out after 1 second
const callServiceB = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:4000', (res) => resolve("Success!"));
    req.on('error', reject);
    req.setTimeout(1000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
};

const breaker = new CircuitBreaker(callServiceB, { failureThreshold: 3, timeout: 10000 });

http.createServer(async (req, res) => {
  try {
    const data = await breaker.fire();
    res.end(data);
  } catch (err) {
    res.writeHead(503);
    res.end(`Fallback: ${err.message}`);
  }
}).listen(3000, () => console.log("Service A on port 3000"));