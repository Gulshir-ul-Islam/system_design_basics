/**
 * This service simulates a database or third-party API that is extremely slow.
 */
const http = require('http');

http.createServer((req, res) => {
  console.log("Service B received a request... delaying response");
  // Simulate a 5-second hang
  setTimeout(() => {
    res.writeHead(200);
    res.end("Data from Service B");
  }, 5000);
}).listen(4000, () => console.log("Flaky Service B on port 4000"));