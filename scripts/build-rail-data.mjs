import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildRailNetwork } from '../src/lib/fare/build-network.mjs'

const network = await buildRailNetwork()
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
writeFileSync(join(outDir, 'rail-network.json'), JSON.stringify(network, null, 2) + '\n')
console.log(`stations ${network.stations.length}, fares ${Object.keys(network.fares).length}`)
console.log('Siam→Asok', network.fares['CEN|E4'], 'Mo Chit→Siam', network.fares['N8|CEN'])
