import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { EditorSpawn, FamilyMember, Species } from '#shared/spawns'

// Link ID → Pokémon → that Pokémon's spawn ID.
type Links = Record<string, Record<string, string>>

interface Evolutions {
  preEvolution?: string
  evolutions?: { result: string }[]
}

interface SpeciesFile extends Evolutions {
  forms?: (Evolutions & { aspects?: string[] })[]
}

let speciesFiles: Map<string, SpeciesFile> | undefined

function speciesFile(id: string) {
  speciesFiles ??= new Map(listJson(join(modJar(sources.cobblemon)!, 'data/cobblemon/species'))
    .map(path => [basename(path, '.json'), readJson<SpeciesFile>(path)]))
  return speciesFiles.get(id)
}

// Every species reachable by evolving forward or back. A regional form (an aspect in the
// properties, like "alolan") follows its own form's evolutions, so it only links within its line.
export function family(species: Species, properties: string): FamilyMember[] {
  const words = properties.split(' ').filter(word => word && !word.includes('='))
  const aspect = speciesFile(species.id)?.forms?.flatMap(form => form.aspects ?? []).find(aspect => words.includes(aspect))
  const seen = new Set<string>()
  const queue = [aspect ? `${species.id} ${aspect}` : species.id]
  while (queue.length > 0) {
    const node = queue.shift()!
    if (seen.has(node)) continue
    seen.add(node)
    const [id, nodeAspect] = node.split(' ')
    const file = speciesFile(id!)
    if (!file) continue
    const form = (nodeAspect && file.forms?.find(form => form.aspects?.includes(nodeAspect))) || file
    const pre = form.preEvolution ?? file.preEvolution
    queue.push(...(form.evolutions ?? file.evolutions ?? []).map(evolution => evolution.result), ...(pre ? [pre] : []))
  }
  const ids = new Set([...seen].map(node => node.split(' ')[0]))
  const links = Object.values(readLinks())
  return allSpecies()
    .filter(member => ids.has(member.id))
    .map((member) => {
      const { status, spawns } = editorSpawns(member)
      const linked = new Set(links.map(link => link[member.id]))
      return {
        id: member.id,
        name: member.name,
        hasSpawns: status !== 'none',
        unlinkedSpawns: spawns.filter(spawn => !linked.has(spawn.id)).map(({ id, habitat, type }) => ({ id, habitat, type }))
      }
    })
}

function readLinks(): Links {
  return existsSync(linksFile) ? readJson<Links>(linksFile) : {}
}

export function withLinks(species: Species, spawns: EditorSpawn[]): EditorSpawn[] {
  const links = readLinks()
  return spawns.map((spawn) => {
    const id = Object.keys(links).find(id => links[id]![species.id] === spawn.id)
    return id ? { ...spawn, link: { id, members: Object.keys(links[id]!).filter(pokemon => pokemon !== species.id) } } : spawn
  })
}

// Removing a linked spawn takes only its Pokémon out of the link; a link with no members left is
// unlinked, and every member keeps its copy.
export function saveLinks(species: Species, spawns: EditorSpawn[]) {
  const kept = new Set(spawns.map(spawn => spawn.link?.id))
  const links: Links = Object.fromEntries(Object.entries(readLinks()).map(([id, link]) =>
    [id, kept.has(id) ? link : Object.fromEntries(Object.entries(link).filter(([pokemon]) => pokemon !== species.id))]))
  for (const spawn of spawns) {
    if (!spawn.link) continue
    const id = spawn.link.id ?? randomUUID().slice(0, 8)
    const old = links[id] ?? {}
    const copyOf = links[spawn.link.copyOf ?? ''] ?? {}
    const link: Record<string, string> = { [species.id]: spawn.id }
    for (const member of spawn.link.members) {
      link[member] = updateMember(findSpecies(member), old[member] ?? spawn.link.join?.[member], spawn, copyOf[member])
    }
    links[id] = link
  }
  writeJson(linksFile, Object.fromEntries(Object.entries(links).filter(([, link]) => Object.keys(link).length > 1)))
}

// Copies a linked spawn's shared fields to one member, adding the spawn if the member lacks it.
// A new copy keeps the bucket, weight, level and lure boosts of the member's spawn `baseId`, if given.
// Members with a draft, or with spawns in the old format, get the change in their draft.
function updateMember(member: Species, spawnId: string | undefined, spawn: EditorSpawn, baseId?: string) {
  const { status, spawns } = editorSpawns(member)
  const { id: _id, bucket: _bucket, weight: _weight, level: _level, lureBoosts: _lureBoosts, link: _link, ...shared } = spawn
  const existing = spawns.find(other => other.id === spawnId)
  let id = spawnId!
  if (existing) {
    Object.assign(existing, shared)
  } else {
    const taken = new Set(spawns.map(other => other.id))
    let n = spawns.length + 1
    while (taken.has(`${member.id}-${n}`)) n++
    id = `${member.id}-${n}`
    const base = spawns.find(other => other.id === baseId) ?? spawn
    spawns.push({ ...spawn, id, bucket: base.bucket, weight: base.weight, level: base.level, lureBoosts: [...base.lureBoosts], link: undefined })
  }
  writeEditorSpawns(member, status, spawns)
  return id
}
