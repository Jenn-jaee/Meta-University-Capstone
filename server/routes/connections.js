const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { formatUserPreview } = require('../utils/connectionHelpers');
const { invalidateFeed } = require('../utils/invalidateFeed');
const userRecommendationEngine = require('../utils/userRecommendationEngine');

const prisma = new PrismaClient();

router.use(checkAuth);

// Get suggested users to connect with
router.get('/suggested', async (req, res) => {
  const userId = req.userId;

  try {
    // Get current user's connections and pending requests
    const [connections, sentRequests, receivedRequests] = await Promise.all([
      // Get existing connections
      prisma.connection.findMany({
        where: {
          OR: [
            { userAId: userId },
            { userBId: userId },
          ],
        },
        select: {
          userAId: true,
          userBId: true,
        },
      }),
      // Get sent connection requests
      prisma.connectionRequest.findMany({
        where: { senderId: userId },
        select: { receiverId: true },
      }),
      // Get received connection requests
      prisma.connectionRequest.findMany({
        where: { receiverId: userId },
        select: { senderId: true },
      }),
    ]);

    // Extract IDs of users we're already connected with or have pending requests
    const connectedUserIds = connections.flatMap(conn =>
      [conn.userAId, conn.userBId]
    ).filter(id => id !== userId);

    const sentRequestUserIds = sentRequests.map(req => req.receiverId);
    const receivedRequestUserIds = receivedRequests.map(req => req.senderId);

    // Combine all IDs to exclude from suggestions
    const excludeUserIds = [
      ...connectedUserIds,
      ...sentRequestUserIds,
      ...receivedRequestUserIds,
    ];

    // Toggle between recommendation algorithms using query parameter
    // Use /api/connections/suggested?algorithm=advanced to get advanced recommendations
    // Use /api/connections/suggested or /api/connections/suggested?algorithm=simple for simple recommendations
    const algorithm = req.query.algorithm || 'simple';
    const useAdvancedRecommendations = algorithm === 'advanced';

    if (useAdvancedRecommendations) {
      // Advanced algorithm with multiple factors and match reasons
      const recommendedUsers = await userRecommendationEngine.getRecommendations(userId, excludeUserIds, 10);

      // Add a subtle marker to identify which algorithm was used (won't affect UI)
      const markedRecommendations = recommendedUsers.map(user => ({
        ...user,
        fromAdvanced: true
      }));

      return res.json(markedRecommendations);
    } else {
      // Simple algorithm that just excludes existing connections
      const suggestedUsers = await prisma.user.findMany({
        where: {
          id: { notIn: [...excludeUserIds, userId] },
        },
        take: 10, // Limit to 10 suggestions
      });

      // Format user data before sending to frontend
      const formattedUsers = suggestedUsers.map(user => formatUserPreview(user));
      return res.json(formattedUsers);
    }
  } catch (error) {
    res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch suggested users.' });
  }
});

// Get all confirmed connections and connection requests for the current user
router.get('/me', async (req, res) => {
  const userId = req.userId;

  try {
    // Get all data in parallel
    const [asUserA, asUserB, incomingRequests, outgoingRequests] = await Promise.all([
      // Get connections where user is userA
      prisma.connection.findMany({
        where: { userAId: userId },
        include: { userB: true },
      }),
      // Get connections where user is userB
      prisma.connection.findMany({
        where: { userBId: userId },
        include: { userA: true },
      }),
      // Get incoming connection requests
      prisma.connectionRequest.findMany({
        where: { receiverId: userId },
        include: { sender: true },
      }),
      // Get outgoing connection requests
      prisma.connectionRequest.findMany({
        where: { senderId: userId },
        include: { receiver: true },
      }),
    ]);

    // Format connections and extract connected user IDs
    const connections = [
      ...asUserA.map((conn) => formatUserPreview(conn.userB)),
      ...asUserB.map((conn) => formatUserPreview(conn.userA)),
    ];

    // Get IDs of users we're already connected with
    const connectedUserIds = new Set([
      ...asUserA.map(conn => conn.userBId),
      ...asUserB.map(conn => conn.userAId)
    ]);

    // Filter out incoming requests from users we're already connected with
    const filteredIncomingRequests = incomingRequests.filter(
      request => !connectedUserIds.has(request.senderId)
    );

    // Filter out outgoing requests to users we're already connected with
    const filteredOutgoingRequests = outgoingRequests.filter(
      request => !connectedUserIds.has(request.receiverId)
    );

    // Format incoming requests
    const formattedIncoming = filteredIncomingRequests.map(request => ({
      ...request,
      sender: formatUserPreview(request.sender)
    }));

    // Format outgoing requests
    const formattedOutgoing = filteredOutgoingRequests.map(request => ({
      ...request,
      receiver: formatUserPreview(request.receiver)
    }));

    // Return both connections and requests
    res.json({
      connections,
      incoming: formattedIncoming,
      outgoing: formattedOutgoing
    });
  } catch (error) {
    res.status(STATUS.SERVER_ERROR).json({ error: "Failed to fetch connections and requests." });
  }
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
      // Invalidate feed caches for both users to ensure immediate feed updates
      invalidateFeed(userId, [otherUserId]);
      invalidateFeed(otherUserId, [userId]);

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
