const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL;
const socket = io(SERVER_URL);

const ID = process.env.HOSTNAME;

socket.on('connect', () => {
  console.log(`[${ID}] Connected to chat!`);

  // Send a message every 7 seconds
  setInterval(() => {
    const msg = `Hello from ${ID} at ${new Date().toLocaleTimeString()}`;
    socket.emit('chat_message', msg);
  }, 7000);
});

// Listen for messages broadcasted by the server
socket.on('chat_message', (data) => {
  console.log(`[${ID}] Received from ${data.user}: ${data.text}`);
});