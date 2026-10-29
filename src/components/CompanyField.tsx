type Props = {
  value: string
  onChange: (value: string) => void
}

export function CompanyField({ value, onChange }: Props) {
  return (
    <div className="card">
      <label className="label" htmlFor="company">
        ชื่อบริษัท
        <span className="ml-2 font-normal text-faint">ใช้ร่วมทุกโมดูล</span>
      </label>
      <input
        id="company"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เช่น ABC Co., Ltd."
        className="field"
      />
    </div>
  )
}
