import { useState } from 'react'

type Props = {
  text: string
}

export function OutputPanel({ text }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="card sticky top-4 border-accent/20 bg-panel-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">ข้อความที่สร้าง</h3>
          <p className="text-xs text-zinc-500">พร้อมวางในระบบเบิก</p>
        </div>
        <button type="button" disabled={!text} onClick={handleCopy} className="btn disabled:cursor-not-allowed disabled:opacity-40">
          {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
        </button>
      </div>
      <p
        className={`min-h-32 rounded-xl border border-dashed px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
          text
            ? 'border-line bg-ink/50 text-zinc-100'
            : 'border-line bg-ink/30 text-zinc-500'
        }`}
      >
        {text || 'กดปุ่มสร้างข้อความ ผลลัพธ์จะอยู่ตรงนี้'}
      </p>
    </div>
  )
}
