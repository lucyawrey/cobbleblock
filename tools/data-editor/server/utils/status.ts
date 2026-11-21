import { copy, fill } from '#shared/copy'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { EditorSpawn, PokemonStatus, Species } from '#shared/spawns'

export function draftPath(species: Species) {
  return join(draftDir, `${species.id}.json`)
}

export function editorSpawns(species: Species): { status: PokemonStatus, spawns: EditorSpawn[] } {
  if (existsSync(draftPath(species))) {
    return { status: 'draft', spawns: readJson<EditorSpawn[]>(draftPath(species)) }
  }
  const pack = packSpawns(species)
  if (pack.length === 0) return { status: 'none', spawns: [] }
  const spawns = pack.map(toEditor).filter(spawn => spawn !== undefined)
  return spawns.length === pack.length ? { status: 'new', spawns } : { status: 'old', spawns: [] }
}

export function findSpecies(id: string) {
  const species = allSpecies().find(species => species.id === id)
  if (!species) throw createError({ statusCode: 404, statusMessage: fill(copy.server.noPokemon, { id }) })
  return species
}

export function allSpawnRefs() {
  return allSpecies().flatMap(species =>
    editorSpawns(species).spawns.map(spawn => ({ pokemon: species.id, id: spawn.id, habitat: spawn.habitat, type: spawn.type }))
  )
}
