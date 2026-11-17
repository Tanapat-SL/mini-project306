const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(config.frontendDir)); // เสิร์ฟหน้าเว็บจากโฟลเดอร์ frontend
app.use('/api', routes);

module.exports = app;
