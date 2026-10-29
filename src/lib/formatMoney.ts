/** Format amount for display in Thai reimbursement text */
export function formatMoney(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString('th-TH')
  }
  return rounded.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function formatKm(km: number): string {
  const rounded = Math.round(km * 100) / 100
  if (Number.isInteger(rounded)) {
    return String(rounded)
  }
  return rounded.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
