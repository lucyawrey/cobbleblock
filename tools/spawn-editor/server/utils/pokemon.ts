import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { EditorSpawn, Species } from '#shared/spawns'
import { spawnTypes, type SpawnType } from '#shared/rules'

const sources = { cobblemon: 'Cobblemon-neoforge', atm: 'ATM x MSD', megaShowdown: 'mega_showdown' }

let speciesCache: Species[] | undefined

export function allSpecies(): Species[] {
  speciesCache ??= listJson(join(modJar(sources.cobblemon)!, 'data/cobblemon/species'))
    .map((path) => {
      const data = readJson<{ name: string, nationalPokedexNumber: number, primaryType: string, secondaryType?: string, implemented?: boolean }>(path)
      return {
        id: basename(path, '.json'),
        name: data.name,
        dex: data.nationalPokedexNumber,
        types: [data.primaryType, data.secondaryType].filter(Boolean),
        implemented: data.implemented ?? false
      }
    })
    .sort((a, b) => a.dex - b.dex)
  return speciesCache
}

export function fileName(species: Species) {
  return `${String(species.dex).padStart(4, '0')}_${species.id}.json`
}

export interface RawSpawn {
  id: string
  pokemon?: string
  presets?: string[]
  bucket: string
  level: string
  weight: number
  condition?: { timeRange?: string, maxLight?: number, neededNearbyBlocks?: string[] }
}

interface SpawnFile {
  enabled?: boolean
  spawns?: RawSpawn[]
}

let baseIndex: Map<string, Record<string, RawSpawn[]>> | undefined

// Reads every base spawn file once, indexed by the Pokémon each spawn names.
function indexBaseSpawns() {
  const index = new Map<string, Record<string, RawSpawn[]>>()
  for (const [source, jar] of Object.entries(sources)) {
    const root = modJar(jar)
    if (!root) continue
    for (const path of listJson(join(root, 'data')).filter(path => path.includes('/spawn_pool_world/'))) {
      const file = readJson<SpawnFile>(path)
      if (file.enabled === false) continue
      for (const spawn of file.spawns ?? []) {
        const pokemon = spawn.pokemon?.split(' ')[0] ?? ''
        const entry = index.get(pokemon) ?? {}
        ;(entry[source] ??= []).push(spawn)
        index.set(pokemon, entry)
      }
    }
  }
  return index
}

export function baseSpawns(species: Species) {
  baseIndex ??= indexBaseSpawns()
  return baseIndex.get(species.id) ?? {}
}

export function packSpawns(species: Species): RawSpawn[] {
  const path = join(spawnDir, fileName(species))
  return existsSync(path) ? readJson<SpawnFile>(path).spawns ?? [] : []
}

function presetId(id: string) {
  return id.replace(/^cobbleblock:/, '')
}

export function toEditor(spawn: RawSpawn): EditorSpawn | undefined {
  const presets = (spawn.presets ?? []).map(presetId)
  const type = presets.find(preset => (spawnTypes as readonly string[]).includes(preset)) as SpawnType | undefined
  const habitat = presets.find(preset => preset !== type)
  if (!type || !habitat) return undefined
  const condition = spawn.condition ?? {}
  return {
    id: spawn.id,
    habitat,
    type,
    bucket: spawn.bucket,
    weight: spawn.weight,
    level: spawn.level,
    timeRange: condition.timeRange ?? 'any',
    dark: condition.maxLight === 7,
    signatureBlocks: condition.neededNearbyBlocks ?? []
  }
}

export function toFile(species: Species, spawn: EditorSpawn) {
  const condition: Record<string, unknown> = {}
  if (spawn.timeRange !== 'any') condition.timeRange = spawn.timeRange
  if (spawn.dark) condition.maxLight = 7
  if (spawn.signatureBlocks.length > 0) condition.neededNearbyBlocks = spawn.signatureBlocks
  return {
    id: spawn.id,
    pokemon: species.id,
    type: 'pokemon',
    presets: [`cobbleblock:${spawn.type}`, `cobbleblock:${spawn.habitat}`],
    bucket: spawn.bucket,
    level: spawn.level,
    weight: spawn.weight,
    ...(Object.keys(condition).length > 0 ? { condition } : {})
  }
}

export function sheetRows(species: Species): Record<string, string | string[]>[] {
  const dir = process.env.SPAWN_SHEET_DIR
  const path = dir && join(dir, 'spawns.csv')
  if (!path || !existsSync(path)) return []
  const [header, ...rows] = parseCsv(readFileSync(path, 'utf8'))
  return rows
    .filter(row => row[1] === species.id)
    .map(row => Object.fromEntries(header!.map((key, i) => [key, row[i] ?? '']).filter(([key, value]) => key && value)
      .map(([key, value]) => [key, value!.includes(',') ? value!.split(/,\s*/) : value])))
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [[]]
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      rows.at(-1)!.push(field)
      field = ''
    } else if (char === '\n') {
      rows.at(-1)!.push(field.replace(/\r$/, ''))
      rows.push([])
      field = ''
    } else {
      field += char
    }
  }
  if (field) rows.at(-1)!.push(field)
  return rows.filter(row => row.length > 1)
}
