import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FARE_URL =
  'https://drt.gdcatalog.go.th/dataset/2f475b29-1792-4bb3-9946-6f0f5a86343d/resource/3f9f03d0-f658-4887-8789-c99fed62f9b8/download/untitled.csv'

const LINE_META = {
  สายสุขุมวิท: { system: 'bts', lineId: 'sukhumvit' },
  สายสีลม: { system: 'bts', lineId: 'silom' },
  สายสีทอง: { system: 'bts', lineId: 'gold' },
  สายสีน้ำเงิน: { system: 'mrt', lineId: 'blue' },
  สายสีม่วง: { system: 'mrt', lineId: 'purple' },
}

const BTS_TH = {
  N24: 'คูคต',
  N23: 'แยก คปอ.',
  N22: 'พิพิธภัณฑ์กองทัพอากาศ',
  N21: 'โรงพยาบาลภูมิพลอดุลยเดช',
  N20: 'สะพานใหม่',
  N19: 'สายหยุด',
  N18: 'พหลโยธิน 59',
  N17: 'วัดพระศรีมหาธาตุ',
  N16: 'กรมทหารราบที่ 11',
  N15: 'บางบัว',
  N14: 'กรมป่าไม้',
  N13: 'มหาวิทยาลัยเกษตรศาสตร์',
  N12: 'เสนานิคม',
  N11: 'รัชโยธิน',
  N10: 'พหลโยธิน 24',
  N9: 'ห้าแยกลาดพร้าว',
  N8: 'หมอชิต',
  N7: 'สะพานควาย',
  N5: 'อารีย์',
  N4: 'สนามเป้า',
  N3: 'อนุสาวรีย์ชัยสมรภูมิ',
  N2: 'พญาไท',
  N1: 'ราชเทวี',
  CEN: 'สยาม',
  E1: 'ชิดลม',
  E2: 'เพลินจิต',
  E3: 'นานา',
  E4: 'อโศก',
  E5: 'พร้อมพงษ์',
  E6: 'ทองหล่อ',
  E7: 'เอกมัย',
  E8: 'พระโขนง',
  E9: 'อ่อนนุช',
  E10: 'บางจาก',
  E11: 'ปุณณวิถี',
  E12: 'อุดมสุข',
  E13: 'บางนา',
  E14: 'แบริ่ง',
  E15: 'สำโรง',
  E16: 'ปู่เจ้า',
  E17: 'ช้างเอราวัณ',
  E18: 'โรงเรียนนายเรือ',
  E19: 'ปากน้ำ',
  E20: 'ศรีนครินทร์',
  E21: 'แพรกษา',
  E22: 'สายลวด',
  E23: 'เคหะ',
  W1: 'สนามกีฬาแห่งชาติ',
  S1: 'ราชดำริ',
  S2: 'ศาลาแดง',
  S3: 'ช่องนนทรี',
  S4: 'เซนต์หลุยส์',
  S5: 'สุรศักดิ์',
  S6: 'สะพานตากสิน',
  S7: 'กรุงธนบุรี',
  S8: 'วงเวียนใหญ่',
  S9: 'โพธิ์นิมิต',
  S10: 'ตลาดพลู',
  S11: 'วุฒากาศ',
  S12: 'บางหว้า',
  G1: 'กรุงธนบุรี',
  G2: 'เจริญนคร',
  G3: 'คลองสาน',
}

function parseCsv(text) {
  return text
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(','))
    .filter((cols) => cols.length >= 9)
}

const response = await fetch(FARE_URL)
if (!response.ok) {
  throw new Error(`Download failed: ${response.status}`)
}
const rows = parseCsv(await response.text())

const stations = []
const seen = new Set()
const fares = {}

const LINE_ORDER = {
  sukhumvit: [
    'N24', 'N23', 'N22', 'N21', 'N20', 'N19', 'N18', 'N17', 'N16', 'N15', 'N14',
    'N13', 'N12', 'N11', 'N10', 'N9', 'N8', 'N7', 'N5', 'N4', 'N3', 'N2', 'N1',
    'CEN', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11',
    'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E19', 'E20', 'E21', 'E22', 'E23',
  ],
  silom: ['W1', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'],
  gold: ['G1', 'G2', 'G3'],
  blue: [
    'BL38', 'BL37', 'BL36', 'BL35', 'BL34', 'BL33', 'BL01', 'BL32', 'BL31', 'BL30',
    'BL29', 'BL28', 'BL27', 'BL26', 'BL25', 'BL24', 'BL23', 'BL22', 'BL21', 'BL20',
    'BL19', 'BL18', 'BL17', 'BL16', 'BL15', 'BL14', 'BL13', 'BL12', 'BL11', 'BL10',
    'BL09', 'BL08', 'BL07', 'BL06', 'BL05', 'BL04', 'BL03', 'BL02',
  ],
  purple: Array.from({ length: 16 }, (_, i) => `PP${String(i + 1).padStart(2, '0')}`),
}

for (const cols of rows) {
  const lineName = cols[2].trim()
  const meta = LINE_META[lineName]
  if (!meta) continue

  const id = cols[3].trim()
  const nameFromFile = cols[4].trim()
  if (nameFromFile.includes('*')) continue
  if (!seen.has(id)) {
    seen.add(id)
    stations.push({
      id,
      nameTh: BTS_TH[id] ?? nameFromFile,
      lineId: meta.lineId,
      system: meta.system,
      orderOnLine: 0,
    })
  }
}

if (!seen.has('BL10')) {
  stations.push({
    id: 'BL10',
    nameTh: 'เตาปูน',
    lineId: 'blue',
    system: 'mrt',
    orderOnLine: 0,
  })
}

for (const station of stations) {
  const order = LINE_ORDER[station.lineId] ?? []
  const index = order.indexOf(station.id)
  station.orderOnLine = index === -1 ? 999 : index
}
stations.sort((a, b) => a.lineId.localeCompare(b.lineId) || a.orderOnLine - b.orderOnLine)

for (const cols of rows) {
  const fromLine = LINE_META[cols[2].trim()]
  const toLine = LINE_META[cols[5].trim()]
  if (!fromLine || !toLine) continue
  if (fromLine.system !== toLine.system) continue
  const fromId = cols[3].trim()
  const toId = cols[6].trim()
  const fare = Number(cols[8])
  if (!Number.isFinite(fare)) continue
  if (cols[4].includes('*') || cols[7].includes('*')) continue
  fares[`${fromId}|${toId}`] = fare
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
writeFileSync(
  join(outDir, 'rail-network.json'),
  JSON.stringify(
    {
      source: FARE_URL,
      sourceName: 'กรมการขนส่งทางราง — ข้อมูลอัตราค่าโดยสารรถไฟฟ้า',
      generatedAt: new Date().toISOString().slice(0, 10),
      stations,
      fares,
    },
    null,
    2,
  ) + '\n',
)

console.log(`stations ${stations.length}, fares ${Object.keys(fares).length}`)
console.log('Siam→Asok', fares['CEN|E4'], 'Mo Chit→Siam', fares['N8|CEN'])
