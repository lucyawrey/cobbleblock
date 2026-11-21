import { copy } from './copy'

export const spawnTypes = ['ground', 'cave', 'surf', 'lava', 'dive', 'seafloor', 'fishing'] as const
export type SpawnType = typeof spawnTypes[number]

export const exposures = ['outdoors', 'sheltered', 'any'] as const
export type Exposure = typeof exposures[number]

export interface Habitat {
  id: string
  blocks: string[]
  exposure: Exposure
  dimensions: string[]
  allowed: SpawnType[]
  draft?: boolean
}

export interface SpawnRef {
  pokemon: string
  id: string
  habitat: string
  type: SpawnType
}

const waterTypes: SpawnType[] = ['surf', 'dive', 'seafloor', 'fishing']

function lists(habitat: Habitat, fluid: string) {
  return habitat.blocks.some(block => block === `minecraft:${fluid}` || block === `#minecraft:${fluid}`)
}

export function blockedReason(habitat: Habitat, type: SpawnType): string | undefined {
  if (type === 'fishing' && habitat.blocks.length > 0) {
    return copy.rules.fishingIgnoresBlocks
  }
  if (waterTypes.includes(type) && lists(habitat, 'water')) {
    return copy.rules.listsWater
  }
  if (type === 'lava' && lists(habitat, 'lava')) {
    return copy.rules.listsLava
  }
  if (type === 'cave' && habitat.exposure === 'outdoors') {
    return copy.rules.caveSheltered
  }
}

export function isAllowed(habitat: Habitat, type: SpawnType) {
  return habitat.allowed.includes(type) && !blockedReason(habitat, type)
}

export function habitatErrors(habitat: Habitat): string[] {
  const errors: string[] = []
  if (!/^[a-z0-9_]+$/.test(habitat.id)) {
    errors.push(copy.rules.idCharacters)
  }
  if ((spawnTypes as readonly string[]).includes(habitat.id)) {
    errors.push(copy.rules.idIsSpawnType)
  }
  if (habitat.dimensions.length === 0) {
    errors.push(copy.rules.noDimension)
  }
  return errors
}

export function wouldBreak(spawns: SpawnRef[], habitat: Habitat) {
  return spawns.filter(spawn => spawn.habitat === habitat.id && !isAllowed(habitat, spawn.type))
}
