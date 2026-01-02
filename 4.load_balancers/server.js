const http = require('http');
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || 'Unknown';

const server = http.createServer((req, res) => {
  // 1. Simple API endpoint
  if (req.url.startsWith('/user/')) {
    const userId = req.url.split('/')[2];
    
    // 2. Manual Delay (simulate heavy work)
    const delay = Math.floor(Math.random() * 1000) + 500; 

    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: userId,
        name: `User ${userId}`,
        servedBy: `Server ${SERVER_ID}`
      }));
    }, delay);
  } 
  // 3. Health Check endpoint
  else if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

server.listen(PORT, () => console.log(`Server ${SERVER_ID} running on port ${PORT}`));