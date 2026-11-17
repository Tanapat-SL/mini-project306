require('dotenv').config();
const path = require('path');

module.exports = {
    port: process.env.PORT || 3000,
    secretKey: process.env.JWT_SECRET || 'fallback-dev-secret',
    frontendDir: path.join(__dirname, '..', '..', '..', 'frontend'),
    db: {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'dorm_system',
        password: process.env.DB_PASSWORD || '',
        port: Number(process.env.DB_PORT) || 5432,
    },
};