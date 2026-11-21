import { expect, it } from 'bun:test'
import { habitatErrors, isAllowed, wouldBreak, type Habitat } from './rules'

function habitat(changes: Partial<Habitat> = {}): Habitat {
  return { id: 'beach', blocks: ['minecraft:sand'], exposure: 'outdoors', dimensions: ['minecraft:overworld'], allowed: ['ground', 'surf', 'dive', 'fishing', 'cave', 'lava'], ...changes }
}

it('only allows spawn types the habitat lists', () => {
  expect(isAllowed(habitat({ allowed: ['ground'] }), 'ground')).toBe(true)
  expect(isAllowed(habitat({ allowed: ['ground'] }), 'surf')).toBe(false)
})

it('blocks water spawn types on a habitat that lists water', () => {
  const wet = habitat({ blocks: ['minecraft:sand', 'minecraft:water'] })
  expect(isAllowed(wet, 'surf')).toBe(false)
  expect(isAllowed(wet, 'dive')).toBe(false)
  expect(isAllowed(wet, 'ground')).toBe(true)
})

it('blocks lava spawns on a habitat that lists lava', () => {
  expect(isAllowed(habitat({ blocks: ['#minecraft:lava'] }), 'lava')).toBe(false)
})

it('only allows fishing on habitats without blocks', () => {
  expect(isAllowed(habitat(), 'fishing')).toBe(false)
  expect(isAllowed(habitat({ blocks: [] }), 'fishing')).toBe(true)
})

it('keeps cave spawns off outdoor habitats', () => {
  expect(isAllowed(habitat(), 'cave')).toBe(false)
  expect(isAllowed(habitat({ exposure: 'any' }), 'cave')).toBe(true)
})

it('refuses a habitat ID that a spawn type uses', () => {
  expect(habitatErrors(habitat({ id: 'cave' }))).toContain('ID is already a spawn type')
  expect(habitatErrors(habitat())).toEqual([])
})

it('lists the spawns on a habitat that a change would break', () => {
  const spawns = [
    { pokemon: 'wingull', id: 'wingull-1', habitat: 'beach', type: 'surf' as const },
    { pokemon: 'krabby', id: 'krabby-1', habitat: 'beach', type: 'ground' as const },
    { pokemon: 'pikachu', id: 'pikachu-1', habitat: 'grassland', type: 'surf' as const }
  ]
  expect(wouldBreak(spawns, habitat({ allowed: ['ground'] })).map(spawn => spawn.id)).toEqual(['wingull-1'])
})
