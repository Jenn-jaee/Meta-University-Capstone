const cache = require('./cache');

module.exports.invalidateFeed = (userId, connectionIds) => {
  // clear this user's own cache
  cache.delete(`feed:${userId}:first`);
  cache.delete(`feed:${userId}:cursor:*`);

  // clear for each connection
  connectionIds.forEach(id => {
    cache.delete(`feed:${id}:first`);
    cache.delete(`feed:${id}:cursor:*`);
  });
};
