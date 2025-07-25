const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserRecommendationEngine {
  constructor() {
    // Weights for different recommendation factors (must sum to 1.0)
    this.weights = {
      mutualConnections: 0.25,  // Shared connections
      recency: 0.15,            // New users (within 14 days)
      moodFrequency: 0.15,      // Similar mood logging patterns
      habitSimilarity: 0.20,    // Matching habit categories
      journalPatterns: 0.15,    // Similar journaling style
      connectionBalance: 0.10   // Users with fewer connections
    };

    // Categories for classifying habits
    this.habitCategories = [
      'exercise', 'nutrition', 'mindfulness', 'learning',
      'productivity', 'sleep', 'hydration', 'social',
      'creativity', 'finance', 'health', 'other'
    ];
  }

  // Get personalized user recommendations based on multiple factors
  async getRecommendations(userId, excludeUserIds = [], limit = 10) {
    try {
      // Find all potential users to recommend (excluding self and connections)
      const potentialUsers = await prisma.user.findMany({
        where: { id: { notIn: [...excludeUserIds, userId] } }
      });

      if (potentialUsers.length === 0) return [];

      // Get current user's vector (behavior profile)
      const currentUserVector = await this._getUserVector(userId);

      // Process users in batches to avoid memory issues
      const batchSize = 50;
      let allScoredUsers = [];

      for (let i = 0; i < potentialUsers.length; i += batchSize) {
        const userBatch = potentialUsers.slice(i, i + batchSize);

        // Get vectors for this batch of users
        const userVectors = await Promise.all(
          userBatch.map(user => this._getUserVector(user.id, userId))
        );

        // Calculate affinity scores for each user
        const scoredBatch = userBatch.map((user, index) => {
          const affinityScore = this._calculateAffinityScore(
            currentUserVector,
            userVectors[index]
          );

          return {
            user: user,
            score: affinityScore,
            components: userVectors[index].scoreComponents
          };
        });

        allScoredUsers = [...allScoredUsers, ...scoredBatch];
      }

      // Sort by score and return top matches with reasons
      return allScoredUsers
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(result => ({
          id: result.user.id,
          displayName: result.user.displayName || result.user.name || 'Anonymous',
          avatarUrl: result.user.avatarUrl || null,
          matchReasons: this._generateMatchReasons(result.components)
        }));
    } catch (error) {
      return [];
    }
  }

  // Calculate weighted score between two users across all dimensions
  _calculateAffinityScore(userA, userB) {
    let weightedScore = 0;

    Object.keys(this.weights).forEach(dimension => {
      const weight = this.weights[dimension];
      const score = this._calculateDimensionScore(userA[dimension], userB[dimension], dimension);
      weightedScore += score * weight;

      // Store individual scores for explanation
      userB.scoreComponents = userB.scoreComponents || {};
      userB.scoreComponents[dimension] = score;
    });

    return weightedScore;
  }

  _calculateDimensionScore(valueA, valueB, dimension) {
    switch (dimension) {
      case 'mutualConnections':
        // Higher score for more mutual connections (max at 5)
        return Math.min(valueB.count / 5, 1);

      case 'recency':
        // Higher score for users who joined within last 14 days
        return valueB.daysActive <= 14 ?
          (14 - valueB.daysActive) / 14 : 0;

      case 'moodFrequency':
        // Compare mood logging frequency patterns
        if (!valueA.logsPerWeek && !valueB.logsPerWeek) return 0.5;
        if (!valueA.logsPerWeek || !valueB.logsPerWeek) return 0.3;

        return 1 - Math.min(
          Math.abs(valueA.logsPerWeek - valueB.logsPerWeek) /
          Math.max(valueA.logsPerWeek, valueB.logsPerWeek, 1),
          1
        );

      case 'habitSimilarity':
        // Compare habit category vectors using cosine similarity
        return this._cosineSimilarity(valueA.categoryVector, valueB.categoryVector);

      case 'journalPatterns':
        // Compare journaling frequency and length
        if (!valueA.entriesPerWeek && !valueB.entriesPerWeek) return 0.5;
        if (!valueA.entriesPerWeek || !valueB.entriesPerWeek) return 0.3;

        const freqSimilarity = 1 - Math.min(
          Math.abs(valueA.entriesPerWeek - valueB.entriesPerWeek) /
          Math.max(valueA.entriesPerWeek, valueB.entriesPerWeek, 1),
          1
        );

        const lengthSimilarity = 1 - Math.min(
          Math.abs(valueA.avgWordCount - valueB.avgWordCount) /
          Math.max(valueA.avgWordCount, valueB.avgWordCount, 100),
          1
        );

        return (freqSimilarity * 0.6) + (lengthSimilarity * 0.4);

      case 'connectionBalance':
        // Favor users with fewer connections (under 10)
        return valueB.connectionCount < 10 ?
          (10 - valueB.connectionCount) / 10 : 0;

      default:
        return 0;
    }
  }

  // Create a vector representation of a user's behavior patterns
  async _getUserVector(userId, referenceUserId = null) {
    try {
      // Fetch all user data in parallel for efficiency
      const [
        mutualConnections,
        userCreatedAt,
        moodLogs,
        habits,
        journalEntries,
        connectionCount
      ] = await Promise.all([
        // Get mutual connections if reference user provided
        referenceUserId ?
          this._getMutualConnectionsCount(userId, referenceUserId) :
          Promise.resolve({ count: 0, users: [] }),

        // Get user creation date
        prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true }
        }),

        // Get mood logs from last 30 days
        prisma.moodLog.findMany({
          where: {
            userId,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),

        // Get all user habits
        prisma.habit.findMany({
          where: { userId }
        }),

        // Get journal entries from last 30 days
        prisma.journalEntry.findMany({
          where: {
            userId,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        }),

        // Get total connection count
        this._getConnectionCount(userId)
      ]);

      const daysActive = Math.ceil(
        (Date.now() - new Date(userCreatedAt?.createdAt || Date.now()).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      const logsPerWeek = (moodLogs.length / 30) * 7;

      const categoryVector = this._generateHabitCategoryVector(habits);

      const entriesPerWeek = (journalEntries.length / 30) * 7;
      const avgWordCount = journalEntries.length > 0 ?
        journalEntries.reduce((sum, entry) =>
          sum + this._countWords(entry.content), 0) / journalEntries.length :
        0;

      return {
        mutualConnections,
        recency: { daysActive },
        moodFrequency: { logsPerWeek },
        habitSimilarity: { categoryVector },
        journalPatterns: { entriesPerWeek, avgWordCount },
        connectionBalance: { connectionCount }
      };
    } catch (error) {
      return {
        mutualConnections: { count: 0, users: [] },
        recency: { daysActive: 999 },
        moodFrequency: { logsPerWeek: 0 },
        habitSimilarity: { categoryVector: Array(this.habitCategories.length).fill(0) },
        journalPatterns: { entriesPerWeek: 0, avgWordCount: 0 },
        connectionBalance: { connectionCount: 0 }
      };
    }
  }

  _generateHabitCategoryVector(habits) {
    const vector = Array(this.habitCategories.length).fill(0);

    habits.forEach(habit => {
      const category = this._categorizeHabit(habit.title, habit.description);
      const index = this.habitCategories.indexOf(category);
      if (index !== -1) {
        vector[index]++;
      }
    });

    return vector;
  }

  _cosineSimilarity(vecA, vecB) {
    if (vecA.every(v => v === 0) || vecB.every(v => v === 0)) {
      return 0;
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    return dotProduct / (magA * magB);
  }

  _categorizeHabit(title, description = '') {
    const text = (title + ' ' + (description || '')).toLowerCase();
    const categoryPatterns = {
      'exercise': /run|jog|walk|gym|workout|exercise|fitness|train|push.?up|sit.?up/,
      'mindfulness': /meditat|mindful|breath|yoga|relax|calm|stress/,
      'learning': /read|book|study|learn|course|class|knowledge/,
      'nutrition': /eat|nutrition|diet|food|meal|vegetable|fruit|healthy/,
      'sleep': /sleep|rest|bed|nap|early|night/,
      'hydration': /water|hydrate|drink|fluid|oz|cup/,
      'productivity': /work|task|productivity|focus|goal|achieve|complete/,
      'social': /friend|family|call|text|social|connect|relationship/,
      'finance': /save|budget|money|finance|spend|invest/,
      'creativity': /art|write|draw|create|music|play|instrument/,
      'health': /health|doctor|medicine|vitamin|supplement|check.?up/
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(text)) {
        return category;
      }
    }

    return 'other';
  }

  async _getMutualConnectionsCount(userA, userB) {
    try {
      const [connectionsA, connectionsB] = await Promise.all([
        this._getUserConnections(userA),
        this._getUserConnections(userB)
      ]);

      const mutualUsers = connectionsA.filter(id => connectionsB.includes(id));

      return {
        count: mutualUsers.length,
        users: mutualUsers
      };
    } catch (error) {
      return { count: 0, users: [] };
    }
  }

  async _getUserConnections(userId) {
    try {
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      });

      return connections.map(conn =>
        conn.userAId === userId ? conn.userBId : conn.userAId
      );
    } catch (error) {
      return [];
    }
  }

  async _getConnectionCount(userId) {
    try {
      const connections = await prisma.connection.count({
        where: {
          OR: [
            { userAId: userId },
            { userBId: userId }
          ]
        }
      });

      return connections;
    } catch (error) {
      return 0;
    }
  }

  _countWords(text) {
    return text?.split(/\s+/).filter(Boolean).length || 0;
  }

  _generateMatchReasons(components) {
    const reasons = [];

    if (!components) return reasons;

    if (components.mutualConnections > 0.3) {
      reasons.push('You have mutual connections');
    }

    if (components.recency > 0.5) {
      reasons.push('Recently joined');
    }

    if (components.moodFrequency > 0.7) {
      reasons.push('Similar mood tracking habits');
    }

    if (components.habitSimilarity > 0.5) {
      reasons.push('Similar habit interests');
    }

    if (components.journalPatterns > 0.7) {
      reasons.push('Similar journaling style');
    }

    if (components.connectionBalance > 0.5) {
      reasons.push('Looking to grow their network');
    }

    return reasons;
  }
}

module.exports = new UserRecommendationEngine();
