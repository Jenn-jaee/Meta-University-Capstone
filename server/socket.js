const { Server } = require('socket.io');

function initSocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store globally so any route/controller can emit: req.app.locals.io.emit(...)
  app.locals.io = io;

  // Basic connection listener
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
  });
}


module.exports = initSocket;
