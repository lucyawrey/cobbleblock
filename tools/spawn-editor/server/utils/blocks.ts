import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

// Gradle downloads this when Core builds; the pack's mods folder has no vanilla jar.
const vanillaJar = join(homedir(), '.gradle/caches/neoformruntime/artifacts/minecraft_1.21.1_client.jar')
const entry = /^(?:assets\/([^/]+)\/blockstates|data\/([^/]+)\/tags\/block)\/(.+)\.json$/

let blockCache: string[] | undefined

// Block IDs come from blockstate files, and `#` tag IDs from block tag files.
export function allBlocks(): string[] {
  if (blockCache) return blockCache
  const mods = join(repo, 'pack/mods')
  const jars = [vanillaJar, ...readdirSync(mods).filter(file => file.endsWith('.jar')).map(file => join(mods, file))].filter(existsSync)
  const core = join(repo, 'core/src/main/resources')
  const paths = [
    ...jars.flatMap(jar => execFileSync('unzip', ['-Z1', jar], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n')),
    ...readdirSync(core, { recursive: true, encoding: 'utf8' }).map(file => relative(core, join(core, file)))
  ]
  const blocks = new Set<string>()
  for (const path of paths) {
    const match = entry.exec(path)
    if (match) blocks.add(match[1] ? `${match[1]}:${match[3]}` : `#${match[2]}:${match[3]}`)
  }
  blockCache = [...blocks].sort()
  return blockCache
}
