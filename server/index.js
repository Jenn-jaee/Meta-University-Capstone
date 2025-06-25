const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


//middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', req.body); //for debugging
    }
    next();
});

//routes
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');

app.use('/api/auth', authRoutes);
app.use('/api', journalRoutes);

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
