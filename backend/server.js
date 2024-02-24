const express = require('express');
const cors = require('cors');
const {connection} = require('./database/connection');
const path = require('path');
const dotenv = require('dotenv').config({ path: `${__dirname}/.env` });
const userRoutes = require('./routes/user');
const followRoutes = require('./routes/follow');
const publicationRoutes = require('./routes/publication');

const serverUp = () => {
  const app = express();
  const port = process.env.PORT;
  app.use(cors());
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true }));
  app.get('/api', (req, res) => res.send('Hello World!'));
  app.use('/api/user', userRoutes);
  app.use('/api/follow', followRoutes);
  app.use('/api/publication', publicationRoutes);
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await connection();
  });
  console.log('Server is up and running on port 5000');
}

serverUp();