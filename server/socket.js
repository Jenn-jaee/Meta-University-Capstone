
const { Server } = require('socket.io');

/**
 * Initializes a Socket.IO server on the existing HTTP server
 * and stores the instance on app.locals for easy access in routes.
 *
 * @param {import('http').Server} httpServer - Node HTTP server created in index.js
 * @param {import('express').Express} app - The Express app instance
 */
function initSocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',          
      methods: ['GET', 'POST']
    }
  });

  // Store globally so any route/controller can emit:  req.app.locals.io.emit(...)
  app.locals.io = io;

module.exports = initSocket;
