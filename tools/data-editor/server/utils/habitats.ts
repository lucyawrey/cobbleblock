import { basename, join } from 'node:path'
import { existsSync } from 'node:fs'
import type { Exposure, Habitat, SpawnType } from '#shared/rules'

interface HabitatCondition {
  dimensions?: string[]
  minSkyLight?: number
  maxSkyLight?: number
  neededNearbyBlocks?: string[]
}

const skyLight: Record<Exposure, [number, number] | undefined> = {
  outdoors: [8, 15],
  sheltered: [0, 7],
  any: undefined
}

function allowedPairs(): Record<string, SpawnType[]> {
  return existsSync(allowedPairsFile) ? readJson<Record<string, SpawnType[]>>(allowedPairsFile) : {}
}

export function readHabitats(): Habitat[] {
  const allowed = allowedPairs()
  return listJson(habitatDir).map((path) => {
    const id = basename(path, '.json')
    const condition = readJson<{ condition?: HabitatCondition }>(path).condition ?? {}
    const exposure = (Object.keys(skyLight) as Exposure[])
      .find(key => skyLight[key]?.[0] === condition.minSkyLight && skyLight[key]?.[1] === condition.maxSkyLight) ?? 'any'
    return {
      id,
      blocks: condition.neededNearbyBlocks ?? [],
      exposure,
      dimensions: condition.dimensions ?? [],
      allowed: allowed[id] ?? []
    }
  }).sort((a, b) => a.id.localeCompare(b.id))
}

// A habitat's blocks are also blocks to stand on, so they go in both lists (see the plan's treetop decision).
export function writeHabitat(habitat: Habitat, oldId?: string) {
  const light = skyLight[habitat.exposure]
  const condition: Record<string, unknown> = { dimensions: habitat.dimensions }
  if (light) {
    condition.minSkyLight = light[0]
    condition.maxSkyLight = light[1]
  }
  if (habitat.blocks.length > 0) {
    condition.neededNearbyBlocks = habitat.blocks
    condition.neededBaseBlocks = habitat.blocks
  }
  const allowed = allowedPairs()
  if (oldId && oldId !== habitat.id) {
    removeFile(join(habitatDir, `${oldId}.json`))
  }
  writeJson(join(habitatDir, `${habitat.id}.json`), { condition })
  const pairs = Object.entries({ ...allowed, [habitat.id]: habitat.allowed }).filter(([id]) => id !== oldId || id === habitat.id)
  writeJson(allowedPairsFile, Object.fromEntries(pairs.sort(([a], [b]) => a.localeCompare(b))))
}
