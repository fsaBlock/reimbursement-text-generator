# สร้างคำเบิกเงินทดรอบ (Onsite Training)

เว็บสำหรับสร้างข้อความเบิกค่าเดินทาง 3 ประเภท: รถส่วนตัว, ทางด่วน, BTS/MRT

## รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

## Build

```bash
npm run build
npm run preview
```

## Deploy บน Vercel

1. Import repo นี้ใน [Vercel](https://vercel.com/new)
2. Framework จะถูกตรวจเป็น Vite จาก `vercel.json`
3. ไม่ต้องตั้ง Environment Variables — `base` ของ Vite เป็น `/` อยู่แล้ว
4. กด Deploy

บนแผนฟรี Vercel จะเรียก `/api/fares` วันละครั้ง (ประมาณ 03:00 น. ตามเวลาไทย) เพื่อโหลดตารางจากกรมการขนส่งทางราง แล้วแคชไว้ 24 ชั่วโมง หน้าเว็บใช้ชุดนั้นเอง ถ้าดึงไม่ได้จะใช้ตารางที่ฝังมากับเว็บ

อัปเดตไฟล์ใน repo เองเมื่อต้องการ:

```bash
npm run update-fares
```

## Deploy ไป GitHub Pages

1. สร้าง repo บน GitHub แล้ว push โค้ด
2. ตั้งชื่อ repo ให้ตรงกับ `homepage` ด้านล่าง (หรือแก้ใน `.env.production`)
3. สร้างไฟล์ `.env.production`:

```env
VITE_BASE_PATH=/ชื่อ-repo/
```

ถ้า repo ชื่อ `username.github.io` ใช้:

```env
VITE_BASE_PATH=/
```

4. Deploy:

```bash
npm run deploy
```

5. ใน GitHub → Settings → Pages → Source: branch `gh-pages` / root

ลิงก์ใช้งาน: `https://<username>.github.io/<ชื่อ-repo>/`

## หมายเหตุ

- เรทรถส่วนตัว default 5.5 บาท/กม. (แก้ได้ในฟอร์ม)
- ค่าโดยสาร BTS/MRT มาจากตารางเปิดของกรมการขนส่งทางราง (อัปเดตด้วย `node scripts/build-rail-data.mjs`)
- BTS ข้ามสายสุขุมวิทกับสีลมคำนวณให้ได้ ถ้าคู่สถานีไม่มีในตารางให้กรอกราคาเอง
