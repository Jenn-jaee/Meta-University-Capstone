const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { formatUserPreview } = require('../utils/connectionHelpers');

const prisma = new PrismaClient();

router.use(checkAuth);

// Get all confirmed connections for the current user
router.get('/me', (req, res) => {
  const userId = req.userId;

  Promise.all([
    prisma.connection.findMany({
      where: { userAId: userId },
      include: { userB: true },
    }),
    prisma.connection.findMany({
      where: { userBId: userId },
      include: { userA: true },
    }),
  ])
  .then(([asUserA, asUserB]) => {
    const connections = [
      ...asUserA.map((conn) => formatUserPreview(conn.userB)),
      ...asUserB.map((conn) => formatUserPreview(conn.userA)),
    ];

    res.json(connections);
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to fetch connections." });
  });
});

// Remove a connection (unfriend a user)
router.delete('/remove/:otherUserId', (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.otherUserId;

  // First check if the connection exists
  prisma.connection.findFirst({
    where: {
      OR: [
        { userAId: userId, userBId: otherUserId },
        { userAId: otherUserId, userBId: userId },
      ],
    },
  })
  .then((connection) => {
    if (!connection) {
      return res.status(STATUS.NOT_FOUND).json({ error: "Connection not found." });
    }

    return prisma.connection.deleteMany({
      where: {
        OR: [
          { userAId: userId, userBId: otherUserId },
          { userAId: otherUserId, userBId: userId },
        ],
      },
    });
  })
  .then((result) => {
    if (result && result.count > 0) {
      res.json({ message: "Connection removed successfully." });
    } else {
      // This should not happen due to the check above, but just in case
      res.status(STATUS.NOT_FOUND).json({ error: "Connection not found." });
    }
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to remove connection." });
  });
});

// Get all connections with formatted user previews
router.get('/', (req, res) => {
  const userId = req.userId;

  prisma.connection.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
    },
    include: {
      userA: true,
      userB: true,
    },
  })
  .then((connections) => {
    const otherUsers = connections.map(conn => {
      const otherUser = conn.userAId === userId ? conn.userB : conn.userA;
      return formatUserPreview(otherUser);
    });

    res.json(otherUsers);
  })
  .catch(() => {
    res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch connections' });
  });
});

module.exports = router;
