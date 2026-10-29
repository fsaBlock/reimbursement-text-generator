import { buildRailNetwork } from '../src/lib/fare/build-network.mjs'
import bundled from '../src/data/rail-network.json' with { type: 'json' }

export default async function handler(_req, res) {
  try {
    const network = await buildRailNetwork()
    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    )
    res.status(200).json({ ...network, live: true })
  } catch {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
    res.status(200).json({ ...bundled, live: false })
  }
}
