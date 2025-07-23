const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { formatUserPreview, validateRequestAccess } = require('../utils/connectionHelpers');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();

// Apply authentication middleware first
router.use(checkAuth);

// Rate limiter: 10 requests per hour per user
const connectionRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many connection requests sent. Please try again later." },
  standardHeaders: true,  // Uses modern RateLimit-* headers
  legacyHeaders: false,   // Disables deprecated X-RateLimit-* headers
  // Use the built-in IP handler for proper IPv6 support
  keyGenerator: function(req) {
    try {
      // If userId is available (set by checkAuth), use it
      if (req.userId) {
        return `user:${req.userId}`;
      }
      // Otherwise use the default IP-based limiting with proper IPv6 support
      return this.ipKeyGenerator(req);
    } catch (err) {
      // If anything goes wrong, use the default IP-based limiting
      return this.ipKeyGenerator(req);
    }
  },
  // Skip rate limiting in development when testing auth edge cases
  skip: (req) => !req.userId && process.env.NODE_ENV === 'development'
});

// 1. Send a connection request
router.post('/send/:receiverId', connectionRequestLimiter, (req, res) => {
  const senderId = req.userId;
  const receiverId = req.params.receiverId;

  if (senderId === receiverId) {
    return res.status(STATUS.BAD_REQUEST).json({ error: "You cannot send a request to yourself." });
  }

  // First check if users are already connected
  prisma.connection.findFirst({
    where: {
      OR: [
        { userAId: senderId, userBId: receiverId },
        { userAId: receiverId, userBId: senderId },
      ],
    },
  })
  .then((existingConnection) => {
    if (existingConnection) {
      return res.status(STATUS.BAD_REQUEST).json({ error: "You are already connected with this user." });
    }

    // Check if receiver exists
    return prisma.user.findUnique({
      where: { id: receiverId }
    });
  })
  .then(user => {
    // This will only execute if the previous promise resolves and returns a value
    // (i.e., if the users are not already connected)
    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({ error: "User not found." });
    }

    return prisma.connectionRequest.create({
      data: {
        senderId,
        receiverId,
      }
    });
  })
  .then(request => {
    // This will only execute if the previous promise resolves and returns a value
    // (i.e., if the user exists and the request was created)
    if (request) {
      res.json(request);
    }
    // If request is undefined, it means we've already sent a response in a previous step
  })
  .catch((err) => {
    if (err.code === 'P2002') {
      res.status(STATUS.BAD_REQUEST).json({ error: "Request already sent." });
    } else {
      res.status(STATUS.SERVER_ERROR).json({ error: "Failed to send request." });
    }
  });
});

// 2. Get incoming + outgoing requests
router.get('/me', (req, res) => {
  const userId = req.userId;

  Promise.all([
    prisma.connectionRequest.findMany({
      where: { receiverId: userId },
      include: { sender: true },
    }),
    prisma.connectionRequest.findMany({
      where: { senderId: userId },
      include: { receiver: true },
    }),
  ])
  .then(([incoming, outgoing]) => {
    // Format user data before sending to frontend
    const formattedIncoming = incoming.map(request => ({
      ...request,
      sender: formatUserPreview(request.sender)
    }));

    const formattedOutgoing = outgoing.map(request => ({
      ...request,
      receiver: formatUserPreview(request.receiver)
    }));

    res.json({
      incoming: formattedIncoming,
      outgoing: formattedOutgoing
    });
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch requests.' });
  });
});

// 3. Accept a request
router.post('/accept/:requestId', async (req, res) => {
  const userId = req.userId;
  const requestId = req.params.requestId;

  try {
    // Find the request
    const request = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: { sender: true }
    });

    if (!validateRequestAccess(request, userId, 'receiver')) {
      return res.status(STATUS.NOT_FOUND).json({ error: "Request not found." });
    }

    // Check if users are already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userAId: request.senderId, userBId: userId },
          { userAId: userId, userBId: request.senderId },
        ],
      },
    });

    if (existingConnection) {
      // If already connected, just delete the request
      await prisma.connectionRequest.delete({ where: { id: requestId } });
      return res.json({ message: "Already connected with this user." });
    }

    const connectionData = {
      userAId: request.senderId,
      userBId: request.receiverId,
    };

    // Use transaction for atomicity with async/await for better error handling
    await prisma.$transaction([
      prisma.connection.create({ data: connectionData }),
      prisma.connectionRequest.delete({ where: { id: requestId } })
    ]);

    res.json({ message: "Connection accepted." });
  } catch (error) {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to accept request." });
  }
});

// 4. Decline a request
router.delete('/decline/:requestId', (req, res) => {
  const userId = req.userId;
  const requestId = req.params.requestId;

  prisma.connectionRequest.findUnique({
    where: { id: requestId },
  })
  .then((request) => {
    if (!validateRequestAccess(request, userId, 'receiver')) {
      return res.status(STATUS.NOT_FOUND).json({ error: "Request not found." });
    }

    return prisma.connectionRequest.delete({ where: { id: requestId } })
      .then(() => res.json({ message: "Request declined." }));
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to decline request." });
  });
});

// 5. Cancel an outgoing request
router.delete('/cancel/:requestId', (req, res) => {
  const userId = req.userId;
  const requestId = req.params.requestId;

  prisma.connectionRequest.findUnique({
    where: { id: requestId },
  })
  .then((request) => {
    if (!validateRequestAccess(request, userId, 'sender')) {
      return res.status(STATUS.NOT_FOUND).json({ error: "Request not found." });
    }

    return prisma.connectionRequest.delete({ where: { id: requestId } })
      .then(() => res.json({ message: "Request canceled." }));
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to cancel request." });
  });
});

module.exports = router;
