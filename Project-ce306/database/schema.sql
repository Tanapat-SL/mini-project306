-- =====================================================
-- DormCare : Database schema (PostgreSQL)
-- สร้างฐานข้อมูลก่อน:  CREATE DATABASE dorm_system;
-- รันไฟล์นี้:  psql -U postgres -d dorm_system -f database/schema.sql
-- หมายเหตุ: สร้างจากโค้ดที่ใช้งานอยู่ (users, repair_reports, room_members, announcements, bills)
-- =====================================================

-- บัญชีผู้ใช้งาน (admin / user)
CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    username  VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(20)  NOT NULL DEFAULT 'user'
              CHECK (role IN ('admin', 'user'))
);

-- รายการแจ้งซ่อม (ผูกกับ users; ลบ user ที่เคยแจ้งซ่อมไม่ได้ -> error 23503)
CREATE TABLE IF NOT EXISTS repair_reports (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   TEXT,                       -- base64 data URL
    status      VARCHAR(50) NOT NULL DEFAULT 'รอดำเนินการ'
                -- ค่าที่ใช้: รอดำเนินการ / กำลังแก้ไข / เสร็จสิ้น
);

-- ผู้พักอาศัยในแต่ละห้อง
CREATE TABLE IF NOT EXISTS room_members (
    id          SERIAL PRIMARY KEY,
    room_number VARCHAR(20)  NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(30)  NOT NULL,
    image_url   TEXT                        -- base64 data URL
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON repair_reports(user_id);

-- ประกาศจากผู้ดูแล (ตรงกับ ensureTable ใน backend/src/routes/announcements.js)
CREATE TABLE IF NOT EXISTS announcements (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- บิลค่าเช่า/น้ำ/ไฟ (ตรงกับ ensureTable ใน backend/src/routes/bills.js)
-- room_number ใช้จับคู่กับ users.username ของผู้พักอาศัย
CREATE TABLE IF NOT EXISTS bills (
    id             SERIAL PRIMARY KEY,
    room_number    VARCHAR(50) NOT NULL,
    billing_month  VARCHAR(50) NOT NULL,
    room_rent      NUMERIC(10,2) DEFAULT 0,
    water_units    NUMERIC(10,2) DEFAULT 0,
    water_rate     NUMERIC(10,2) DEFAULT 18,
    electric_units NUMERIC(10,2) DEFAULT 0,
    electric_rate  NUMERIC(10,2) DEFAULT 8,
    total_amount   NUMERIC(10,2) NOT NULL,
    slip_url       TEXT,                    -- base64 data URL ของสลิปโอนเงิน
    status         VARCHAR(50) NOT NULL DEFAULT 'รอชำระเงิน',
                   -- ค่าที่ใช้: รอชำระเงิน / รอตรวจสอบสลิป / ชำระแล้ว / สลิปไม่ถูกต้อง
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);