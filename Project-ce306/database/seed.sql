-- ข้อมูลเริ่มต้น (ไม่บังคับ) : แอดมินตัวอย่าง -- เปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบ
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin1234', 'admin')
ON CONFLICT (username) DO NOTHING;
