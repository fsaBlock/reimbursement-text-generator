import railNetwork from '../../data/rail-network.json'
import type { FareResult, Station } from './types'

export type RailSystem = 'bts' | 'mrt'

type Network = {
  sourceName: string
  stations: Station[]
  fares: Record<string, number>
}

const network = railNetwork as Network

export const fareSourceName = network.sourceName

export function getStations(system: RailSystem): Station[] {
  return network.stations
    .filter((station) => station.system === system)
    .sort((a, b) => a.lineId.localeCompare(b.lineId) || a.orderOnLine - b.orderOnLine)
}

export function getStationById(system: RailSystem, id: string): Station | undefined {
  return getStations(system).find((station) => station.id === id)
}

export function calculateFare(
  system: RailSystem,
  fromId: string,
  toId: string,
): FareResult {
  const from = getStationById(system, fromId)
  const to = getStationById(system, toId)

  if (!from || !to) {
    return { ok: false, reason: 'ไม่พบสถานีที่เลือก' }
  }

  const fare = network.fares[`${fromId}|${toId}`]
  if (fare === undefined) {
    return {
      ok: false,
      reason: 'ไม่มีราคาในตารางค่าโดยสาร — กรุณากรอกตามที่จ่ายจริง',
    }
  }

  const stationCount =
    from.lineId === to.lineId ? Math.abs(from.orderOnLine - to.orderOnLine) : null

  return { ok: true, fare, stationCount }
}

export function lineLabel(lineId: string): string {
  const labels: Record<string, string> = {
    sukhumvit: 'BTS สายสุขุมวิท',
    silom: 'BTS สายสีลม',
    gold: 'BTS สายสีทอง',
    blue: 'MRT สายสีน้ำเงิน',
    purple: 'MRT สายสีม่วง',
  }
  return labels[lineId] ?? lineId
}
