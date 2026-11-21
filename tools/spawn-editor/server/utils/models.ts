import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { Species } from '#shared/spawns'

interface Resolver {
  order: number
  species: string
  variations: { aspects: string[], model?: string, texture?: string, poser?: string }[]
}

interface Pose {
  poseTypes?: string[]
  isBattle?: boolean
  animations?: string[]
  transformedParts?: { part: string, isVisible?: boolean }[]
}

let modelFiles: Map<string, string> | undefined
let resolvers: Resolver[] | undefined
let posers: Map<string, string> | undefined
let animations: Map<string, string> | undefined

// The pose Cobblemon shows in profiles and when standing still, as its idle animation's bones and any hidden parts.
function standingPose(root: string, poser: string) {
  posers ??= new Map(listJson(join(root, 'bedrock/pokemon/posers')).map(path => [basename(path, '.json'), path]))
  animations ??= new Map(listJson(join(root, 'bedrock/pokemon/animations')).map(path => [basename(path, '.animation.json'), path]))
  const path = posers.get(poser.replace(/^cobblemon:/, ''))
  const poses = Object.values(path ? readJson<{ poses: Record<string, Pose> }>(path).poses : {})
  const pose = poses.find(pose => pose.poseTypes?.includes('PROFILE')) ?? poses.find(pose => !pose.isBattle && pose.poseTypes?.includes('STAND'))
  const [, group, name] = pose?.animations?.map(animation => /bedrock\('([^']+)',\s*'([^']+)'\)/.exec(animation)).find(Boolean) ?? []
  const file = group && animations.get(group)
  const bones = file ? readJson<{ animations: Record<string, { bones?: unknown }> }>(file).animations[`animation.${group}.${name}`]?.bones : undefined
  return { bones: bones ?? {}, hidden: pose?.transformedParts?.filter(part => part.isVisible === false).map(part => part.part) ?? [] }
}

// The species' base look: the resolver with the lowest order, and its variation with no aspects.
export function pokemonModel(species: Species) {
  const root = join(modJar(sources.cobblemon)!, 'assets/cobblemon')
  modelFiles ??= new Map(listJson(join(root, 'bedrock/pokemon/models')).map(path => [basename(path, '.json'), path]))
  resolvers ??= listJson(join(root, 'bedrock/pokemon/resolvers')).map(path => readJson<Resolver>(path))
  const base = resolvers
    .filter(resolver => resolver.species === `cobblemon:${species.id}`)
    .sort((a, b) => a.order - b.order)[0]
    ?.variations.find(variation => variation.aspects.length === 0)
  const model = base?.model && modelFiles.get(base.model.replace(/^cobblemon:/, ''))
  const texture = base?.texture && join(root, base.texture.replace(/^cobblemon:/, ''))
  if (!model || !texture || !existsSync(texture)) return undefined
  return {
    geometry: readJson<unknown>(model),
    texture: `data:image/png;base64,${readFileSync(texture).toString('base64')}`,
    pose: base.poser ? standingPose(root, base.poser) : undefined
  }
}
