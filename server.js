const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const pool = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
