const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();
const USER_ID = '25a5eec2-94ef-46d6-83d9-c63cd9f5885e';

const DAYS = 7;

function randomMood() {
  return faker.number.int({ min: 1, max: 5 });
}

async function main() {
  const today = new Date();

  for (let i = 0; i < DAYS; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);   // i days ago
    day.setHours(10, 0, 0, 0);          // safe daytime hour

    /* ---------- Mood log (one per day) ---------- */
    await prisma.moodLog.create({
      data: {
        mood: randomMood(),
        note: faker.hacker.phrase(),
        createdAt: day,   // back-date!
        userId: USER_ID,
      },
    });

    /* ---------- Journal entry (only every other day for ~65 %) ---------- */
    if (i % 2 === 0) {
      await prisma.journalEntry.create({
        data: {
          title: faker.lorem.sentence(3),
          content: faker.lorem.paragraphs(2),
          createdAt: day,
          userId: USER_ID,
        },
      });
    }
  }

  console.log(`Seeded ${DAYS} days of data for user ${USER_ID}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
