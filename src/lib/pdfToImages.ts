import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export type PageImage = {
  name: string
  blob: Blob
}

export async function pdfToImages(file: File, scale = 2): Promise<PageImage[]> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const baseName = file.name.replace(/\.pdf$/i, '') || 'document'
  const pages: PageImage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) throw new Error('ไม่สามารถสร้างภาพได้')
    await page.render({ canvas, canvasContext, viewport }).promise
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('แปลงหน้ารูปไม่สำเร็จ'))
      }, 'image/png')
    })
    const index = String(pageNumber).padStart(2, '0')
    pages.push({ name: `${baseName}-หน้า-${index}.png`, blob })
    page.cleanup()
  }

  return pages
}
