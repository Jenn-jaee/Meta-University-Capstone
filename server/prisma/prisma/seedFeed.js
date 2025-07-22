const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

/**
 * Seeds the database with test data for social feed functionality
 * Creates two users with a mutual connection and sample activities
 */
(async () => {
  try {
    // Create or update first test user (Zayo)
    const userA = await prisma.user.upsert({
      where: { email: 'zayo@gmail.com' },
      update: {},
      create: {
        email: 'zayo@gmail.com',
        password: '$2b$10$iwx01S7BGyPYTPTZN2QwOuky3a0VqxwoI/m1DRrvMJjOqwiPDuOEO',
        name: 'Zayo',
      },
    });

    // Create or update second test user (Ball)
    const userB = await prisma.user.upsert({
      where: { email: 'ball@gmail.com' },
      update: {},
      create: {
        email: 'ball@gmail.com',
        password: '$2b$10$qgUYLQfETJf.9i0BZyNBBe281vWY7/quW4pqL0G8Ca598DO1sVstS',
        name: 'ball',
      },
    });

    // Create mutual connection between the two users
    await prisma.connection.upsert({
      where: {
        userAId_userBId: {
          userAId: userA.id,
          userBId: userB.id,
        },
      },
      update: {},
      create: {
        userAId: userA.id,
        userBId: userB.id,
      },
    });

    // Generate sample mood logs for user B
    for (let i = 0; i < 3; i++) {
      await prisma.moodLog.create({
        data: {
          mood: faker.number.int({ min: 0, max: 5 }),
          note: faker.lorem.sentence(),
          userId: userB.id,
        },
      });
    }

    // Generate sample journal entries for user B
    for (let i = 0; i < 2; i++) {
      await prisma.journalEntry.create({
        data: {
          title: faker.lorem.words(4),
          content: faker.lorem.paragraph(),
          journalMood: faker.number.int({ min: 0, max: 5 }),
          userId: userB.id,
        },
      });
    }

    // Create a sample habit for user B
    const habit = await prisma.habit.create({
      data: {
        title: 'Meditation',
        description: '10-minute daily meditation',
        userId: userB.id,
      },
    });

    // Create a completed habit log entry for user B
    await prisma.habitLog.create({
      data: {
        date: new Date('2024-07-12T12:00:00Z'),
        completed: true,
        habitId: habit.id,
        userId: userB.id,
      },
    });

  } catch (err) {
  } finally {
    await prisma.$disconnect();
  }
})();
