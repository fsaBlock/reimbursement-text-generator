export type GridOptions = {
  columns: number
  gap: number
  background: string | null
  cellWidth: number
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('อ่านรูปไม่สำเร็จ'))
    }
    image.src = url
  })
}

export async function imagesToGrid(blobs: Blob[], options: GridOptions): Promise<Blob> {
  const images = await Promise.all(blobs.map(loadImage))
  if (images.length === 0) throw new Error('ยังไม่มีรูป')

  const columns = Math.max(1, Math.min(options.columns, images.length))
  const gap = options.gap
  const cellWidth = options.cellWidth
  const rows = Math.ceil(images.length / columns)
  const rowHeights: number[] = []

  for (let row = 0; row < rows; row += 1) {
    let height = 0
    for (let col = 0; col < columns; col += 1) {
      const image = images[row * columns + col]
      if (!image) continue
      height = Math.max(height, Math.round((image.height / image.width) * cellWidth))
    }
    rowHeights.push(height)
  }

  const width = columns * cellWidth + gap * (columns + 1)
  const height = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0) + gap * (rows + 1)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('ไม่สามารถสร้างภาพกริดได้')

  if (options.background) {
    context.fillStyle = options.background
    context.fillRect(0, 0, width, height)
  }

  images.forEach((image, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    const y =
      gap + rowHeights.slice(0, row).reduce((sum, rowHeight) => sum + rowHeight + gap, 0)
    const x = gap + col * (cellWidth + gap)
    const drawHeight = Math.round((image.height / image.width) * cellWidth)
    const offsetY = y + (rowHeights[row] - drawHeight) / 2
    context.drawImage(image, x, offsetY, cellWidth, drawHeight)
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('บันทึกรูปกริดไม่สำเร็จ'))
    }, 'image/png')
  })
}
