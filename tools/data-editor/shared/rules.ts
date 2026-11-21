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
    return 'Cobblemon ignores a habitat\'s blocks on fishing spawns'
  }
  if (waterTypes.includes(type) && lists(habitat, 'water')) {
    return 'the habitat lists water, so the block check would always pass'
  }
  if (type === 'lava' && lists(habitat, 'lava')) {
    return 'the habitat lists lava, so the block check would always pass'
  }
  if (type === 'cave' && habitat.exposure === 'outdoors') {
    return 'cave spawns are always sheltered'
  }
}

export function isAllowed(habitat: Habitat, type: SpawnType) {
  return habitat.allowed.includes(type) && !blockedReason(habitat, type)
}

export function habitatErrors(habitat: Habitat): string[] {
  const errors: string[] = []
  if (!/^[a-z0-9_]+$/.test(habitat.id)) {
    errors.push('ID can only use lower case letters, digits and _')
  }
  if ((spawnTypes as readonly string[]).includes(habitat.id)) {
    errors.push('ID is already a spawn type')
  }
  if (habitat.dimensions.length === 0) {
    errors.push('pick at least one dimension')
  }
  return errors
}

export function wouldBreak(spawns: SpawnRef[], habitat: Habitat) {
  return spawns.filter(spawn => spawn.habitat === habitat.id && !isAllowed(habitat, spawn.type))
}
