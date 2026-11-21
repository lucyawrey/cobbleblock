import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

// Gradle downloads this when Core builds; the pack's mods folder has no vanilla jar.
const vanillaJar = join(homedir(), '.gradle/caches/neoformruntime/artifacts/minecraft_1.21.1_client.jar')
const entry = /^(?:assets\/([^/]+)\/blockstates|data\/([^/]+)\/tags\/block)\/(.+)\.json$/

let blockCache: string[] | undefined
// Where each asset or data file lives: a jar, or Core's resources folder.
const assetSources = new Map<string, string>()

// Block IDs come from blockstate files, and `#` tag IDs from block tag files.
export function allBlocks(): string[] {
  if (blockCache) return blockCache
  const mods = join(repo, 'pack/mods')
  const jars = [vanillaJar, ...readdirSync(mods).filter(file => file.endsWith('.jar')).map(file => join(mods, file))].filter(existsSync)
  const core = join(repo, 'core/src/main/resources')
  for (const jar of jars) {
    for (const path of execFileSync('unzip', ['-Z1', jar], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n')) assetSources.set(path, jar)
  }
  for (const file of readdirSync(core, { recursive: true, encoding: 'utf8' })) assetSources.set(relative(core, join(core, file)), core)
  const paths = [...assetSources.keys()]
  const blocks = new Set<string>()
  for (const path of paths) {
    const match = entry.exec(path)
    if (match) blocks.add(match[1] ? `${match[1]}:${match[3]}` : `#${match[2]}:${match[3]}`)
  }
  blockCache = [...blocks].sort()
  return blockCache
}

function readAsset(path: string): Buffer | undefined {
  allBlocks()
  const source = assetSources.get(path)
  if (!source) return undefined
  return source.endsWith('.jar') ? execFileSync('unzip', ['-p', source, path], { maxBuffer: 1 << 26 }) : readFileSync(join(source, path))
}

function readAssetJson<T>(path: string): T | undefined {
  const data = readAsset(path)
  return data && JSON.parse(data.toString('utf8')) as T
}

const split = (id: string) => (id.includes(':') ? id : `minecraft:${id}`).split(':') as [string, string]

interface Variant {
  model: string
  x?: number
}

// A block's model: the first blockstate variant that isn't turned on its side, or the first multipart piece.
function blockModel(id: string) {
  const [namespace, name] = split(id)
  const state = readAssetJson<{ variants?: Record<string, Variant | Variant[]>, multipart?: { apply: Variant | Variant[] }[] }>(`assets/${namespace}/blockstates/${name}.json`)
  const variants = [...Object.values(state?.variants ?? {}), ...(state?.multipart ?? []).map(part => part.apply)]
    .map(variant => Array.isArray(variant) ? variant[0]! : variant)
  return (variants.find(variant => !variant.x) ?? variants[0])?.model
}

export interface BlockIcon {
  top?: string
  side?: string
  flat?: string
}

const iconCache = new Map<string, BlockIcon>()

// Textures to draw a block as a small cube, or flat for plants (cross models) and blocks without top and side textures.
export function blockIcon(id: string): BlockIcon {
  const cached = iconCache.get(id)
  if (cached) return cached
  const textures: Record<string, string> = {}
  const models: string[] = []
  for (let model = blockModel(id); model && models.length < 20;) {
    const [namespace, name] = split(model)
    models.push(name)
    const data = readAssetJson<{ parent?: string, textures?: Record<string, string> }>(`assets/${namespace}/models/${name}.json`)
    for (const [key, value] of Object.entries(data?.textures ?? {})) textures[key] ??= value
    model = data?.parent
  }
  const resolve = (key: string) => {
    let value = textures[key]
    for (let depth = 0; value?.startsWith('#') && depth < 10; depth++) value = textures[value.slice(1)]
    if (!value || value.startsWith('#')) return undefined
    const [namespace, path] = split(value)
    const png = readAsset(`assets/${namespace}/textures/${path}.png`)
    return png && `data:image/png;base64,${png.toString('base64')}`
  }
  const pick = (...keys: string[]) => keys.map(resolve).find(Boolean)
  const cross = models.some(name => name.endsWith('cross'))
  const top = cross ? undefined : pick('top', 'end', 'up', 'all', 'texture')
  const side = cross ? undefined : pick('side', 'all', 'north', 'front', 'texture')
  const icon = top && side ? { top, side } : { flat: pick('cross', 'plant', 'texture', 'all', 'particle') }
  iconCache.set(id, icon)
  return icon
}
