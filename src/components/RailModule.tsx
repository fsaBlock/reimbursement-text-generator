import {
  calculateFare,
  getStationById,
  getStations,
  lineLabel,
  type RailSystem,
} from '../lib/fare'
import type { Station } from '../lib/fare/types'
import { buildRailText } from '../lib/templates'
import { OutputPanel } from './OutputPanel'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  company: string
}

function StationSelect({
  label,
  stations,
  value,
  onChange,
}: {
  label: string
  stations: Station[]
  value: string
  onChange: (id: string) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Station[]>()
    for (const s of stations) {
      const list = map.get(s.lineId) ?? []
      list.push(s)
      map.set(s.lineId, list)
    }
    return map
  }, [stations])

  return (
    <div>
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      >
        <option value="">— เลือกสถานี —</option>
        {[...grouped.entries()].map(([lineId, list]) => (
          <optgroup key={lineId} label={lineLabel(lineId)}>
            {list.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameTh}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

export function RailModule({ company }: Props) {
  const [system, setSystem] = useState<RailSystem>('bts')
  const stations = useMemo(() => getStations(system), [system])

  const [fromOut, setFromOut] = useState('')
  const [toOut, setToOut] = useState('')
  const [fromBack, setFromBack] = useState('')
  const [toBack, setToBack] = useState('')

  const [manualOut, setManualOut] = useState('')
  const [manualBack, setManualBack] = useState('')

  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [fareHint, setFareHint] = useState('')

  const fareOutResult = useMemo(() => {
    if (!fromOut || !toOut) return null
    return calculateFare(system, fromOut, toOut)
  }, [system, fromOut, toOut])

  const fareBackResult = useMemo(() => {
    if (!fromBack || !toBack) return null
    return calculateFare(system, fromBack, toBack)
  }, [system, fromBack, toBack])

  useEffect(() => {
    setFromOut('')
    setToOut('')
    setFromBack('')
    setToBack('')
    setManualOut('')
    setManualBack('')
    setOutput('')
    setFareHint('')
  }, [system])

  useEffect(() => {
    if (fromOut && toOut && !fromBack && !toBack) {
      setFromBack(toOut)
      setToBack(fromOut)
    }
  }, [fromOut, toOut, fromBack, toBack])

  useEffect(() => {
    const parts: string[] = []
    if (fareOutResult && !fareOutResult.ok) parts.push(`ขาไป: ${fareOutResult.reason}`)
    if (fareBackResult && !fareBackResult.ok) parts.push(`ขากลับ: ${fareBackResult.reason}`)
    setFareHint(parts.join(' '))
  }, [fareOutResult, fareBackResult])

  function resolveFare(
    result: ReturnType<typeof calculateFare> | null,
    manual: string,
  ): number | null {
    if (result?.ok) return result.fare
    if (manual.trim() === '') return null
    const n = Number(manual)
    if (Number.isNaN(n) || n < 0) return null
    return n
  }

  function handleGenerate() {
    setError('')
    const trimmedCompany = company.trim()
    if (!trimmedCompany) {
      setError('กรุณากรอกชื่อบริษัทด้านบน')
      return
    }
    if (!fromOut || !toOut || !fromBack || !toBack) {
      setError('กรุณาเลือกสถานีครบทั้งขาไปและขากลับ')
      return
    }

    const fareOut = resolveFare(fareOutResult, manualOut)
    const fareBack = resolveFare(fareBackResult, manualBack)

    if (fareOut === null) {
      setError('กรุณากรอกราคาขาไป (ระบบคำนวณไม่ได้สำหรับเส้นทางนี้)')
      return
    }
    if (fareBack === null) {
      setError('กรุณากรอกราคาขากลับ (ระบบคำนวณไม่ได้สำหรับเส้นทางนี้)')
      return
    }

    const fromOutSt = getStationById(system, fromOut)
    const toOutSt = getStationById(system, toOut)
    const fromBackSt = getStationById(system, fromBack)
    const toBackSt = getStationById(system, toBack)

    if (!fromOutSt || !toOutSt || !fromBackSt || !toBackSt) {
      setError('ไม่พบข้อมูลสถานี')
      return
    }

    setOutput(
      buildRailText({
        company: trimmedCompany,
        fromOut: fromOutSt.nameTh,
        toOut: toOutSt.nameTh,
        fareOut,
        fromBack: fromBackSt.nameTh,
        toBack: toBackSt.nameTh,
        fareBack,
      }),
    )
  }

  const needManualOut = fareOutResult !== null && !fareOutResult.ok
  const needManualBack = fareBackResult !== null && !fareBackResult.ok

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold text-white">เบิกค่าเดินทางรถไฟฟ้า</h2>
        <p className="mb-5 text-sm text-zinc-500">
          ราคาจากตารางกรมการขนส่งทางราง รวมข้ามสายสุขุมวิท–สีลมได้ ถ้าไม่มีในตารางให้กรอกเอง
        </p>

        <div className="mb-5 inline-flex rounded-xl border border-line bg-ink/60 p-1">
          {(['bts', 'mrt'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSystem(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                system === s ? 'bg-accent text-accent-ink' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s === 'bts' ? 'BTS' : 'MRT'}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-accent">ขาไป</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <StationSelect
                label="จากสถานี"
                stations={stations}
                value={fromOut}
                onChange={setFromOut}
              />
              <StationSelect
                label="ถึงสถานี"
                stations={stations}
                value={toOut}
                onChange={setToOut}
              />
            </div>
            {fareOutResult?.ok && (
              <p className="mt-2 text-sm text-accent">
                ราคาตามตาราง: {fareOutResult.fare} บาท
                {fareOutResult.stationCount !== null
                  ? ` (${fareOutResult.stationCount} สถานี)`
                  : ''}
              </p>
            )}
            {needManualOut && (
              <div className="mt-3 max-w-xs">
                <label className="label text-amber-200">ราคาขาไป (บาท) — กรอกเอง</label>
                <input
                  type="number"
                  min={0}
                  value={manualOut}
                  onChange={(e) => setManualOut(e.target.value)}
                  className="field border-amber-400/40"
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-accent">ขากลับ</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <StationSelect
                label="จากสถานี"
                stations={stations}
                value={fromBack}
                onChange={setFromBack}
              />
              <StationSelect
                label="ถึงสถานี"
                stations={stations}
                value={toBack}
                onChange={setToBack}
              />
            </div>
            {fareBackResult?.ok && (
              <p className="mt-2 text-sm text-accent">
                ราคาตามตาราง: {fareBackResult.fare} บาท
                {fareBackResult.stationCount !== null
                  ? ` (${fareBackResult.stationCount} สถานี)`
                  : ''}
              </p>
            )}
            {needManualBack && (
              <div className="mt-3 max-w-xs">
                <label className="label text-amber-200">ราคาขากลับ (บาท) — กรอกเอง</label>
                <input
                  type="number"
                  min={0}
                  value={manualBack}
                  onChange={(e) => setManualBack(e.target.value)}
                  className="field border-amber-400/40"
                />
              </div>
            )}
          </div>
        </div>

        {fareHint && <p className="mt-4 text-sm text-amber-200">{fareHint}</p>}
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        <button type="button" onClick={handleGenerate} className="btn mt-5">
          สร้างข้อความ
        </button>
      </div>
      <OutputPanel text={output} />
    </div>
  )
}
