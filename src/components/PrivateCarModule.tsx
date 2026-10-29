import { useMemo, useState } from 'react'
import { formatMoney } from '../lib/formatMoney'
import { buildPrivateCarText } from '../lib/templates'
import { OutputPanel } from './OutputPanel'

type Props = {
  company: string
}

export function PrivateCarModule({ company }: Props) {
  const [outKm, setOutKm] = useState('')
  const [backKm, setBackKm] = useState('')
  const [rate, setRate] = useState('5.5')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  function handleGenerate() {
    setError('')
    const trimmedCompany = company.trim()
    if (!trimmedCompany) {
      setError('กรุณากรอกชื่อบริษัทด้านบน')
      return
    }
    const out = Number(outKm)
    const back = Number(backKm)
    const rateNum = Number(rate)
    if (Number.isNaN(out) || out < 0 || Number.isNaN(back) || back < 0) {
      setError('กรุณากรอกระยะทาง (กม.) ให้ถูกต้อง')
      return
    }
    if (Number.isNaN(rateNum) || rateNum <= 0) {
      setError('กรุณากรอกเรทต่อกิโลเมตรให้ถูกต้อง')
      return
    }
    setOutput(
      buildPrivateCarText({
        company: trimmedCompany,
        outKm: out,
        backKm: back,
        rate: rateNum,
      }),
    )
  }

  const preview = useMemo(() => {
    const out = Number(outKm)
    const back = Number(backKm)
    const rateNum = Number(rate)
    if (outKm.trim() === '' || backKm.trim() === '' || rate.trim() === '') return null
    if ([out, back, rateNum].some((n) => Number.isNaN(n) || n < 0) || rateNum <= 0) return null
    return {
      out: out * rateNum,
      back: back * rateNum,
      total: (out + back) * rateNum,
    }
  }, [outKm, backKm, rate])

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold text-white">เบิกค่าเดินทางรถส่วนตัว</h2>
        <p className="mb-5 text-sm text-zinc-500">คำนวณขาไป ขากลับ และยอดรวมตามเรทบริษัท</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">ระยะทางขาไป (กม.)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={outKm}
              onChange={(e) => setOutKm(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="label">ระยะทางขากลับ (กม.)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={backKm}
              onChange={(e) => setBackKm(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="label">เรท (บาท/กม.)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="field"
            />
          </div>
        </div>
        {preview && (
          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-ink/50 p-3 text-center">
            <div>
              <dt className="text-xs text-zinc-500">ขาไป</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{formatMoney(preview.out)}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">ขากลับ</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{formatMoney(preview.back)}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">รวม</dt>
              <dd className="mt-1 text-sm font-semibold text-accent">{formatMoney(preview.total)}</dd>
            </div>
          </dl>
        )}
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <button type="button" onClick={handleGenerate} className="btn mt-5">
          สร้างข้อความ
        </button>
      </div>
      <OutputPanel text={output} />
    </div>
  )
}
