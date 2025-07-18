const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const path = require('path');
const http = require('http');
const initSocket = require('./socket');
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
    cookie: { maxAge: 5000 } // 5 seconds
  }));
  app.use(passport.initialize());
  app.use(passport.session());

//routes
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');
const checkAuth = require('./middleware/checkAuth');
const habitRoutes = require('./routes/habit');
const habitLogsRouter = require('./routes/habitLogs');
const userRouter = require('./routes/user');
const moodLogsRoute = require('./routes/moodLogs');
const plantGrowthRoutes = require('./routes/plantGrowth');
const recoRoute = require('./routes/analyticsRecommendation');

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habit-logs', habitLogsRouter);
app.use('/api/user', userRouter);
app.use('/api/mood-logs', moodLogsRoute);
app.use('/api/plant-growth', plantGrowthRoutes);
app.use('/api', recoRoute);




//Test route
app.get('/', (req, res) => {
    res.json({ status: 'Server is running' });
  });
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

//start server
const server = http.createServer(app);   // 1. create HTTP server
initSocket(server, app);
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server + WebSocket running on port ${PORT}`);
});
