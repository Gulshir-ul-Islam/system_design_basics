const io = require('socket.io')(3000, {
  cors: { origin: "*" }
});

console.log("🚀 Chat Server started on port 3000");

io.on('connection', (socket) => {
  const userId = socket.id.substring(0, 5);
  console.log(`[Server] User ${userId} connected`);

  socket.on('chat_message', (msg) => {
    console.log(`[Server] Message from ${userId}: ${msg}`);
    
    // This sends to everyone EXCEPT the sender
    socket.broadcast.emit('chat_message', { user: userId, text: msg });
  });

  socket.on('disconnect', () => {
    console.log(`[Server] User ${userId} disconnected`);
  });
});