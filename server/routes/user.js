const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const multer = require('multer');
const path = require('path');
const handleError = require('../utils/handleError');   // centralized error helper
const { STATUS } = require('../constants');

const prisma = new PrismaClient();
const router = express.Router();

/* ────────── Multer storage config ──────────
 * We give every file a unique name: userId-timestamp.ext
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

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
        avatarUrl: true,
        phone: true,
        darkMode: true,
        dailyReminders: true,
        privateJournal: true,
        hasSeenWelcome: true,
        googleId: true, // tells frontend if email should be read-only
        currentStreak: true, // Include the streak from the database
      },
    });

    if (!user) return res.status(STATUS.NOT_FOUND).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    return handleError(res, err, 'Failed to fetch user');
  }
});

// PATCH /api/user/profile
router.patch('/profile', checkAuth, async (req, res) => {
  const { displayName, phone, email, hasSeenWelcome, darkMode } = req.body;

  try {
    // Build data object conditionally
    const data = {
      ...(displayName && { displayName }),
      ...(phone && { phone }),
      ...(hasSeenWelcome !== undefined && { hasSeenWelcome }),
      ...(darkMode !== undefined && { darkMode }),
    };

    // Only allow email change for non-OAuth accounts
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { googleId: true },
    });
    if (!currentUser.googleId && email) data.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        phone: true,
        avatarUrl: true,
        darkMode: true,
        dailyReminders: true,
        privateJournal: true,
        hasSeenWelcome: true,
        googleId: true,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    return handleError(res, err, 'Failed to update profile');
  }
});

// POST /api/user/avatar
router.post('/avatar', checkAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(STATUS.BAD_REQUEST).json({ error: 'No file uploaded' });

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl },
    });

    res.json({ avatarUrl, status: 'success' });
  } catch (err) {
    return handleError(res, err, 'Avatar upload failed');
  }
});

module.exports = router;
