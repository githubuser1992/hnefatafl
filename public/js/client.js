const socket = io();

socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('message', (data) => {
  console.log('Message from server:', data);
});

function sendMessageToServer(message) {
  socket.emit('message', message);
}
