const http = require('http');

// Define our backend servers
const servers = [
  { host: 'server1', port: 3000, alive: true },
  { host: 'server2', port: 3000, alive: true }
];

let current = 0;

// 1. Health Check Logic
setInterval(() => {
  servers.forEach(s => {
    const req = http.request({ host: s.host, port: s.port, path: '/health', method: 'GET' }, (res) => {
      s.alive = (res.statusCode === 200);
    });
    req.on('error', () => s.alive = false);
    req.end();
  });
}, 5000);

// 2. Routing Logic (Round Robin)
const lb = http.createServer((req, res) => {
  // Filter only healthy servers
  const healthyServers = servers.filter(s => s.alive);

  if (healthyServers.length === 0) {
    res.writeHead(502);
    return res.end('Bad Gateway: No healthy upstream servers');
  }

  // Round Robin selection
  const target = healthyServers[current % healthyServers.length];
  current++;

  // 3. Proxy the request
  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end();
  });

  req.pipe(proxyReq);
});

lb.listen(80, () => console.log('Load Balancer running on port 80'));