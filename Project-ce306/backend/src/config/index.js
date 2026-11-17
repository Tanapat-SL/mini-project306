const path = require('path');

// ค่าเริ่มต้นเท่ากับของเดิม -> รันได้เหมือนเดิม
// ถ้าต้องการเปลี่ยนโดยไม่แก้โค้ด ให้ตั้ง environment variable (เช่น DB_PASSWORD=xxx)
module.exports = {
    port: process.env.PORT || 3000,
    secretKey: process.env.JWT_SECRET || 'mysecretkey',
    frontendDir: path.join(__dirname, '..', '..', '..', 'frontend'),
    db: {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'dorm_system',
        password: process.env.DB_PASSWORD || 'lift9678', // อย่าลืมแก้รหัสผ่าน!
        port: Number(process.env.DB_PORT) || 5432,
    },
};
