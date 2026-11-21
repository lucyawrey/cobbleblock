import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { Species } from '#shared/spawns'

interface Resolver {
  order: number
  species: string
  variations: { aspects?: string[], model?: string, texture?: string, poser?: string }[]
}

interface Pose {
  poseTypes?: string[]
  isBattle?: boolean
  animations?: string[]
  transformedParts?: { part: string, isVisible?: boolean }[]
}

interface PokemonAssets {
  files: Map<string, string>
  resolvers: Resolver[]
}

let assets: PokemonAssets | undefined

// Cobblemon's Pokémon assets with the pack's add-ons layered on top, later jars winning for the same file, as in game.
function pokemonAssets(): PokemonAssets {
  if (assets) return assets
  const files = new Map<string, string>()
  for (const jar of [sources.cobblemon, sources.megaShowdown, sources.atm]) {
    const root = join(modJar(jar)!, 'assets')
    for (const file of readdirSync(root, { recursive: true, encoding: 'utf8' })) files.set(file, join(root, file))
  }
  const resolvers = [...files.entries()].filter(([path]) => /^[^/]+\/bedrock\/pokemon\/resolvers\/.+\.json$/.test(path)).map(([, path]) => readJson<Resolver>(path))
  assets = { files, resolvers }
  return assets
}

// A bedrock file by its name alone (`bulbasaur_male.geo`), from any namespace.
function bedrockFile(folder: string, name: string, extension = '.json') {
  const suffix = `/bedrock/pokemon/${folder}/`
  for (const [path, file] of [...pokemonAssets().files].reverse()) {
    if (path.includes(suffix) && basename(path) === `${name}${extension}`) return file
  }
  return undefined
}

// The pose Cobblemon shows in profiles and when standing still, as its idle animation's bones and any hidden parts.
function standingPose(poser: string) {
  const path = bedrockFile('posers', poser.split(':').pop()!)
  const poses = Object.values(path ? readJson<{ poses: Record<string, Pose> }>(path).poses : {})
  const pose = poses.find(pose => pose.poseTypes?.includes('PROFILE')) ?? poses.find(pose => !pose.isBattle && pose.poseTypes?.includes('STAND'))
  const [, group, name] = pose?.animations?.map(animation => /bedrock\('([^']+)',\s*'([^']+)'\)/.exec(animation)).find(Boolean) ?? []
  const file = group && bedrockFile('animations', group, '.animation.json')
  const bones = file ? readJson<{ animations: Record<string, { bones?: unknown }> }>(file).animations[`animation.${group}.${name}`]?.bones : undefined
  return { bones: bones ?? {}, hidden: pose?.transformedParts?.filter(part => part.isVisible === false).map(part => part.part) ?? [] }
}

// The species' base look: its resolvers' variations with no aspects, layered by order.
export function pokemonModel(species: Species) {
  const { files, resolvers } = pokemonAssets()
  const base = resolvers
    .filter(resolver => resolver.species === `cobblemon:${species.id}`)
    .sort((a, b) => a.order - b.order)
    .flatMap(resolver => resolver.variations.filter(variation => !variation.aspects?.length))
    .reduce<Resolver['variations'][number]>((merged, variation) => ({ ...merged, ...variation }), {})
  const model = base.model && bedrockFile('models', base.model.split(':').pop()!)
  const [namespace, texturePath] = base.texture?.split(':') ?? []
  const texture = texturePath && files.get(`${namespace}/${texturePath}`)
  if (!model || !texture) return undefined
  return {
    geometry: readJson<unknown>(model),
    texture: `data:image/png;base64,${readFileSync(texture).toString('base64')}`,
    pose: base.poser ? standingPose(base.poser) : undefined
  }
}
