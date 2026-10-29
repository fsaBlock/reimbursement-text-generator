export type Station = {
  id: string
  nameTh: string
  lineId: string
  system: 'bts' | 'mrt'
  orderOnLine: number
}

export type FareResult =
  | { ok: true; fare: number; stationCount: number | null }
  | { ok: false; reason: string }
