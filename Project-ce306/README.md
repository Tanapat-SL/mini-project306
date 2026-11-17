# DormCare – ระบบแจ้งซ่อมและจัดการข้อมูลหอพัก

```
dorm-system/
├── frontend/            หน้าเว็บ (HTML / CSS / JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── utils.js          ฟังก์ชันช่วย (alert, badge, escapeHtml ...)
│       ├── auth.js           login / logout / สลับหน้าตามสิทธิ์
│       ├── reports.js        รายการแจ้งซ่อม
│       ├── announcements.js  ประกาศ
│       ├── members.js        ผู้พักอาศัย
│       ├── accounts.js       จัดการบัญชี
│       └── main.js           แท็บแอดมิน + จุดเริ่มต้น
├── backend/             เซิร์ฟเวอร์ Express + API
│   ├── server.js             สั่งรันเซิร์ฟเวอร์
│   ├── package.json
│   └── src/
│       ├── app.js            ตั้งค่า express
│       ├── config/           ค่าตั้งค่า + การเชื่อมต่อ PostgreSQL
│       ├── middleware/auth.js  ตรวจ JWT / ตรวจสิทธิ์ admin
│       └── routes/           auth, reports, members, users
└── database/
    ├── schema.sql            สร้างตาราง
    └── seed.sql              แอดมินตัวอย่าง (ไม่บังคับ)
```

## วิธีรัน
1. สร้างฐานข้อมูล `dorm_system` แล้วรัน `database/schema.sql` (และ `seed.sql` ถ้าต้องการ)
2. `cd backend && npm install && npm start`
3. เปิด http://localhost:3000

ตั้งค่าผ่าน environment variable ได้: `PORT`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
(ถ้าไม่ตั้ง จะใช้ค่าเดิมเหมือนในโค้ดก่อนจัดระเบียบ)
