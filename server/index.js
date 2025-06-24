const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


//middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} ${Date.now()}`);
    next();
})

//routes
app.get('/', (req, res) => {
  console.log('Health check');
  res.json({ message: 'Server is healthy' });

});

//start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
