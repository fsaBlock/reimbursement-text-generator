import { useState, type ReactNode } from 'react'
import { getTheme, toggleTheme, type Theme } from '../lib/theme'

type TabId = 'car' | 'toll' | 'rail'

type Props = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  companyField: ReactNode
  children: ReactNode
}

const tabs: { id: TabId; label: string; hint: string }[] = [
  { id: 'car', label: 'รถส่วนตัว', hint: 'กม. × เรทบริษัท' },
  { id: 'toll', label: 'ทางด่วน', hint: 'ไป-กลับรวม' },
  { id: 'rail', label: 'รถไฟฟ้า', hint: 'BTS / MRT' },
]

export function Layout({ activeTab, onTabChange, companyField, children }: Props) {
  const [theme, setThemeState] = useState<Theme>(() => getTheme())

  function onToggleTheme() {
    setThemeState(toggleTheme())
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/80 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              Onsite Training
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              สร้างคำเบิกเงินทดรอบ
            </h1>
            <p className="mt-1 text-sm text-muted">กรอกครั้งเดียว แล้วคัดลอกข้อความไปวางในระบบเบิก</p>
          </div>
          <button type="button" onClick={onToggleTheme} className="btn-ghost" aria-pressed={theme === 'light'}>
            {theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">{companyField}</div>

        <nav className="mb-5 grid grid-cols-3 gap-2" aria-label="โมดูล">
          {tabs.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? 'border-accent/50 bg-accent/15 text-fg shadow-[0_0_0_1px_rgba(62,224,176,0.25)]'
                    : 'border-line bg-panel/70 text-muted hover:border-accent hover:text-fg'
                }`}
              >
                <span className="block text-sm font-semibold sm:text-base">{tab.label}</span>
                <span className={`mt-0.5 hidden text-xs sm:block ${active ? 'text-accent' : 'text-faint'}`}>
                  {tab.hint}
                </span>
              </button>
            )
          })}
        </nav>

        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-faint">
        ค่าโดยสารรถไฟฟ้ามาจากตารางเปิดของกรมการขนส่งทางราง — ตรวจกับตั๋วที่จ่ายจริงก่อนยื่นเบิก
      </footer>
    </div>
  )
}

export type { TabId }
