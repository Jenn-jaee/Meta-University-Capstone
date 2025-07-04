const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/user/me
router.get('/me', checkAuth, async (req, res) => {
try {
const user = await prisma.user.findUnique({
where: { id: req.userId },
select: {
id: true,
email: true,
name: true,
displayName: true,
hasSeenWelcome: true,
},
});

if (!user) return res.status(404).json({ error: 'User not found' });

res.json(user);
} catch (err) {
console.error('Error fetching user:', err);
res.status(500).json({ error: 'Failed to fetch user' });
}
});

// PATCH /api/user/profile
router.patch('/profile', checkAuth, async (req, res) => {
const { displayName, hasSeenWelcome } = req.body;

try {
const updatedUser = await prisma.user.update({
where: { id: req.userId },
data: {
...(displayName && { displayName }),
...(hasSeenWelcome !== undefined && { hasSeenWelcome }),
},
select: {
id: true,
email: true,
name: true,
displayName: true,
hasSeenWelcome: true,
},
});

res.json(updatedUser);
} catch (err) {
console.error('Error updating profile:', err);
res.status(500).json({ error: 'Failed to update profile info' });
}
});

module.exports = router;
