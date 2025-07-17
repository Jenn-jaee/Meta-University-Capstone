const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');
const http = require('http');
const initSocket = require('./socket');
const { STATUS } = require('./constants');
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//passport config and session setup (for authentication)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 24 hours (in milliseconds)
}));
app.use(passport.initialize());
app.use(passport.session());

//routes
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');
const habitRoutes = require('./routes/habit');
const habitLogsRouter = require('./routes/habitLogs');
const userRouter = require('./routes/user');
const moodLogsRoute = require('./routes/moodLogs');
const plantGrowthRoutes = require('./routes/plantGrowth');
const recoRoute = require('./routes/analyticsRecommendation');
const feedRoutes = require('./routes/feed');
const shareSettingsRoutes = require('./routes/shareSettings');
const connectionRequestRoutes = require('./routes/connectionRequests');
const connectionRoutes = require('./routes/connections');

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habit-logs', habitLogsRouter);
app.use('/api/user', userRouter);
app.use('/api/mood-logs', moodLogsRoute);
app.use('/api/plant-growth', plantGrowthRoutes);
app.use('/api', recoRoute);
app.use('/api/feed', feedRoutes);
app.use('/api/share-settings', shareSettingsRoutes);
app.use('/api/connection-requests', connectionRequestRoutes);
app.use('/api/connections', connectionRoutes);

//Test route
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Global error handler middleware - catches any unhandled errors in the application
app.use((err, req, res, next) => {
  res.status(STATUS.SERVER_ERROR).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

//start server
const server = http.createServer(app);   // 1. create HTTP server
initSocket(server, app);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server + WebSocket running on port ${PORT}`);
});
