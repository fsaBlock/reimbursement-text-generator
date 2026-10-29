import { useState } from 'react'
import { buildTollText } from '../lib/templates'
import { OutputPanel } from './OutputPanel'

type Props = {
  company: string
}

export function TollModule({ company }: Props) {
  const [amount, setAmount] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function handleGenerate() {
    setError('')
    const trimmedCompany = company.trim()
    if (!trimmedCompany) {
      setError('กรุณากรอกชื่อบริษัทด้านบน')
      return
    }
    const num = Number(amount)
    if (Number.isNaN(num) || num < 0) {
      setError('กรุณากรอกค่าทางด่วนไป-กลับให้ถูกต้อง')
      return
    }
    setOutput(buildTollText({ company: trimmedCompany, amount: num }))
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold text-white">เบิกค่าทางด่วน</h2>
        <p className="mb-5 text-sm text-zinc-500">ใส่ยอดไป-กลับรวมตามใบเสร็จ</p>
        <div className="max-w-sm">
          <label className="label">ค่าทางด่วนไป-กลับรวม (บาท)</label>
          <input
            type="number"
            min={0}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field"
          />
        </div>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <button type="button" onClick={handleGenerate} className="btn mt-5">
          สร้างข้อความ
        </button>
      </div>
      <OutputPanel text={output} />
    </div>
  )
}
