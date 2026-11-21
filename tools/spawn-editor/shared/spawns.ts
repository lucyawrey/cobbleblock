import type { Habitat, SpawnType } from './rules'

export interface Species {
  id: string
  name: string
  dex: number
  types: string[]
  implemented: boolean
}

export interface EditorSpawn {
  id: string
  habitat: string
  type: SpawnType
  bucket: string
  weight: number
  level: string
  timeRange: string
  dark: boolean
  weather: Weather
  moonPhases: number[]
  // Weight multipliers for lure levels 1, 2 and 3; fishing spawns only.
  lureBoosts: number[]
  properties: string
  signatureBlocks: string[]
}

export type PokemonStatus = 'none' | 'old' | 'draft' | 'new'

export interface PokemonListItem extends Species {
  status: PokemonStatus
}

export interface PokemonDetail {
  species: Species
  status: PokemonStatus
  base: Record<string, unknown[]>
  sheet: Record<string, string | string[]>[]
  pack: unknown[]
  spawns: EditorSpawn[]
}

export interface HabitatData {
  habitats: Habitat[]
  spawns: { pokemon: string, id: string, habitat: string, type: SpawnType }[]
}

export const buckets = ['common', 'uncommon', 'rare', 'ultra-rare']
export const timeRanges = ['any', 'day', 'night', 'morning', 'noon', 'afternoon', 'evening', 'midnight', 'predawn', 'dawn', 'dusk', 'twilight']

export const weathers = ['any', 'clear', 'rain', 'thunder'] as const
export type Weather = typeof weathers[number]

export const moonPhases = ['full', 'waning gibbous', 'last quarter', 'waning crescent', 'new', 'waxing crescent', 'first quarter', 'waxing gibbous']

// A custom time range as ticks; a range past midnight wraps, written as two ranges.
export function parseTicks(timeRange: string): [number, number] | undefined {
  const match = /^(\d+)-(\d+)(?:,0-(\d+))?$/.exec(timeRange)
  return match ? [Number(match[1]), Number(match[3] ?? match[2])] : undefined
}

export function formatTicks([from, to]: [number, number]) {
  return from <= to ? `${from}-${to}` : `${from}-23999,0-${to}`
}

export const newSpawn = (id: string): EditorSpawn => ({ id, habitat: 'overworld', type: 'ground', bucket: 'common', weight: 1, level: '1-50', timeRange: 'any', dark: false, weather: 'any', moonPhases: [], lureBoosts: [1, 1, 1], properties: '', signatureBlocks: [] })
