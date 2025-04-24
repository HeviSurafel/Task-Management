// socket.js
const socketIo = require('socket.io');

const setupSocketIo = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for new comments
    socket.on('newComment', (comment) => {
      // Broadcast the new comment to all clients
      io.emit('newComment', comment);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = setupSocketIo;