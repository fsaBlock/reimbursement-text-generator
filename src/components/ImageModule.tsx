import JSZip from 'jszip'
import { useEffect, useRef, useState } from 'react'
import { downloadBlob } from '../lib/downloadBlob'
import { imagesToGrid } from '../lib/imageGrid'
import { pdfToImages, type PageImage } from '../lib/pdfToImages'

type Mode = 'pdf' | 'grid'
type GridItem = PageImage & { url: string }

export function ImageModule() {
  const [mode, setMode] = useState<Mode>('pdf')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pages, setPages] = useState<GridItem[]>([])
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [columns, setColumns] = useState(2)
  const [gap, setGap] = useState(16)
  const [background, setBackground] = useState('#ffffff')
  const [previewUrl, setPreviewUrl] = useState('')

  const pagesRef = useRef(pages)
  const gridRef = useRef(gridItems)
  const previewRef = useRef(previewUrl)
  pagesRef.current = pages
  gridRef.current = gridItems
  previewRef.current = previewUrl

  useEffect(() => {
    return () => {
      pagesRef.current.forEach((page) => URL.revokeObjectURL(page.url))
      gridRef.current.forEach((item) => URL.revokeObjectURL(item.url))
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  async function onPdfSelected(file: File | undefined) {
    if (!file) return
    setError('')
    setBusy(true)
    pages.forEach((page) => URL.revokeObjectURL(page.url))
    try {
      const images = await pdfToImages(file)
      setPages(images.map((image) => ({ ...image, url: URL.createObjectURL(image.blob) })))
    } catch {
      setError('อ่านไฟล์ PDF ไม่ได้ ลองไฟล์ที่ไม่ได้ล็อกด้วยรหัสผ่าน')
      setPages([])
    } finally {
      setBusy(false)
    }
  }

  async function downloadAll() {
    if (pages.length === 0) return
    const zip = new JSZip()
    pages.forEach((page) => zip.file(page.name, page.blob))
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'pdf-pages.zip')
  }

  function sendToGrid() {
    setGridItems((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url))
      return pages.map((page) => ({ ...page, url: URL.createObjectURL(page.blob) }))
    })
    setPreviewUrl('')
    setMode('grid')
  }

  async function addGridFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const next: GridItem[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const blob = file
      next.push({ name: file.name, blob, url: URL.createObjectURL(blob) })
    }
    setGridItems((current) => [...current, ...next])
    setPreviewUrl('')
  }

  function removeGridItem(index: number) {
    setGridItems((current) => {
      const removed = current[index]
      if (removed) URL.revokeObjectURL(removed.url)
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
    setPreviewUrl('')
  }

  async function buildGrid() {
    if (gridItems.length === 0) {
      setError('เพิ่มรูปอย่างน้อย 1 รูป')
      return
    }
    setError('')
    setBusy(true)
    try {
      const blob = await imagesToGrid(
        gridItems.map((item) => item.blob),
        { columns, gap, background: background || null, cellWidth: 900 },
      )
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {
      setError('จัดรูปเป็นกริดไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  async function downloadGrid() {
    if (!previewUrl) return
    const response = await fetch(previewUrl)
    downloadBlob(await response.blob(), 'image-grid.png')
  }

  return (
    <div className="card">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">PDF เป็นรูป และจัดกริด</h2>
          <p className="mt-1 text-sm text-faint">แปลงทุกหน้าของ PDF เป็น PNG แล้วจัดหลายรูปให้อยู่ในภาพเดียว</p>
        </div>
        <div className="inline-flex rounded-xl border border-line bg-ink/60 p-1">
          {([
            ['pdf', 'PDF เป็นรูป'],
            ['grid', 'รวมเป็นกริด'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === id ? 'bg-accent text-accent-ink' : 'text-muted hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'pdf' ? (
        <div className="space-y-4">
          <label className="label">ไฟล์ PDF</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="field"
            onChange={(event) => onPdfSelected(event.target.files?.[0])}
          />
          {pages.length > 0 && (
            <>
              <p className="text-sm text-muted">ได้ {pages.length} หน้า</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pages.map((page) => (
                  <figure key={page.url} className="overflow-hidden rounded-xl border border-line bg-ink/40">
                    <img src={page.url} alt={page.name} className="h-40 w-full object-contain" />
                    <figcaption className="truncate px-2 py-1 text-xs text-faint">{page.name}</figcaption>
                  </figure>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn" onClick={downloadAll} disabled={busy}>
                  ดาวน์โหลดทั้งหมด (ZIP)
                </button>
                <button type="button" className="btn-ghost" onClick={sendToGrid}>
                  เอาไปจัดกริด
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <label className="label">เพิ่มรูป</label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="field"
            onChange={(event) => addGridFiles(event.target.files)}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">จำนวนคอลัมน์</label>
              <input
                type="number"
                min={1}
                max={6}
                value={columns}
                onChange={(event) => setColumns(Number(event.target.value) || 1)}
                className="field"
              />
            </div>
            <div>
              <label className="label">ช่องว่าง (px)</label>
              <input
                type="number"
                min={0}
                max={80}
                value={gap}
                onChange={(event) => setGap(Number(event.target.value) || 0)}
                className="field"
              />
            </div>
            <div>
              <label className="label">สีพื้น</label>
              <input
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="field h-12 p-1"
              />
            </div>
          </div>
          {gridItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {gridItems.map((item, index) => (
                <div key={item.url} className="relative overflow-hidden rounded-xl border border-line">
                  <img src={item.url} alt={item.name} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGridItem(index)}
                    className="absolute top-1 right-1 rounded-md bg-ink/80 px-1.5 text-xs text-fg"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={buildGrid} disabled={busy}>
              {busy ? 'กำลังจัด...' : 'สร้างกริด'}
            </button>
            <button type="button" className="btn-ghost" onClick={downloadGrid} disabled={!previewUrl}>
              ดาวน์โหลด PNG
            </button>
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="ภาพกริด" className="max-h-[32rem] w-full rounded-xl border border-line object-contain" />
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
    </div>
  )
}
