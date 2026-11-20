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
