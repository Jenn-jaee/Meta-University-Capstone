const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const app = express();


//middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.debug('Request body:', req.body); //for debugging
    }
    next();
});

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
const moodsRoutes = require('./routes/moods');
const userRouter = require('./routes/user');
const moodLogsRoute = require('./routes/moodLogs');
const plantGrowthRoutes = require('./routes/plantGrowth');






app.use('/api/auth', authRoutes);
app.use('/api', checkAuth, journalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/habit-logs', habitLogsRouter);
app.use('/api/moods', moodsRoutes);
app.use('/api/user', userRouter);
app.use('/api/mood-logs', moodLogsRoute);
app.use('/api/plant-growth', plantGrowthRoutes);






//Test route
app.get('/', (req, res) => {
    console.log('Health check');
    res.json({ status: 'Server is running' });

  });
app.get('/api/health', (req, res) => {
  console.log('Health check');
  res.json({ status: 'Server is running' });

});

//start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
