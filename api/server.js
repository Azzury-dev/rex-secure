require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const { requireAuth } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const guildRoutes = require('./routes/guilds');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/guilds', requireAuth, guildRoutes);

app.get('/', (_req, res) => {
  res.json({ ok: true, api: 'Rex Secure' });
});

const port = process.env.API_PORT || 3000;
app.listen(port, () => console.log(`[Dashboard] http://localhost:${port}`));
