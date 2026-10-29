import { formatKm, formatMoney } from './formatMoney'

export function buildPrivateCarText(params: {
  company: string
  outKm: number
  backKm: number
  rate: number
}): string {
  const { company, outKm, backKm, rate } = params
  const outAmount = outKm * rate
  const backAmount = backKm * rate
  const totalKm = outKm + backKm
  const totalAmount = totalKm * rate

  return (
    `เบิกค่าเดินทาง Onsite Training ${company} ` +
    `ระยะทางขาไป ${formatKm(outKm)} กิโลเมตร X ${formatKm(rate)} ตามเรทบริษัท ` +
    `เป็นเงิน ${formatMoney(outAmount)} บาท ` +
    `ระยะทางขากลับ ${formatKm(backKm)} กิโลเมตร X ${formatKm(rate)} ตามเรทบริษัท ` +
    `เป็นเงิน ${formatMoney(backAmount)} บาท ` +
    `รวมระยะทางไปกลับ ${formatKm(totalKm)} กิโลเมตร X ${formatKm(rate)} ตามเรทบริษัท ` +
    `รวมเป็นเงิน ${formatMoney(totalAmount)} บาท`
  )
}

export function buildTollText(params: {
  company: string
  amount: number
}): string {
  const { company, amount } = params
  return `เบิกค่าทางด่วน Onsite Training ${company} ไป-กลับเป็นเงิน ${formatMoney(amount)} บาท`
}

export function buildRailText(params: {
  company: string
  fromOut: string
  toOut: string
  fareOut: number
  fromBack: string
  toBack: string
  fareBack: number
}): string {
  const { company, fromOut, toOut, fareOut, fromBack, toBack, fareBack } = params
  return (
    `เบิกค่าเดินทาง Onsite Training ${company} ทางรถไฟฟ้า ` +
    `ขาไปจากสถานี ${fromOut} ถึงสถานี ${toOut} เป็นราคา ${formatMoney(fareOut)} บาท ` +
    `และขากลับ จากสถานี ${fromBack} ถึงสถานี ${toBack} เป็นราคา ${formatMoney(fareBack)} บาท`
  )
}
