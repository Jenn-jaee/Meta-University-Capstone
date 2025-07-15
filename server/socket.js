// socket.js  – initial Socket.IO setup
// CommonJS style, no new dependencies beyond socket.io

const { Server } = require('socket.io');

/**
 * Initializes a Socket.IO server on the existing HTTP server
 * and stores the instance on app.locals for easy access in routes.
 *
 * @param {import('http').Server} httpServer - Node HTTP server created in index.js
 * @param {import('express').Express} app - The Express app instance
 */
function initSocket(httpServer, app) {
  // Allow CORS for the frontend origin; adjust later if needed
  const io = new Server(httpServer, {
    cors: {
      origin: '*',            // replace with your front‑end URL in prod
      methods: ['GET', 'POST']
    }
  });

  // Store globally so any route/controller can emit:  req.app.locals.io.emit(...)
  app.locals.io = io;

  // Basic connection listener
  io.on('connection', (socket) => {
    console.log('🔌  New client connected', socket.id);

    // Optional: add auth check here if you later include JWT in the handshake
    // socket.on('authenticate', token => { ... })

    socket.on('disconnect', () => {
      console.log('❌  Client disconnected', socket.id);
    });
  });
}

module.exports = initSocket;
