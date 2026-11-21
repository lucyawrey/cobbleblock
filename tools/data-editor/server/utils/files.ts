import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

export const repo = resolve(process.cwd(), '../..')
export const packData = join(repo, 'core/src/main/resources/data/cobbleblock')
export const spawnDir = join(packData, 'spawn_pool_world')
export const habitatDir = join(packData, 'spawn_detail_presets/habitats')
export const allowedPairsFile = join(process.cwd(), 'allowed-pairs.json')
export const habitatDraftsFile = join(process.cwd(), 'habitat-drafts.json')
export const draftDir = join(process.cwd(), 'drafts')
const cacheDir = join(process.cwd(), '.cache/jars')

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, undefined, 2) + '\n')
}

export function removeFile(path: string) {
  rmSync(path, { force: true })
}

export function listJson(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('.json'))
    .map(file => join(dir, file))
}

// Unpacks a mod jar's data and assets once, with the system's unzip, so no zip package is needed.
export function modJar(namePrefix: string): string | undefined {
  const mods = join(repo, 'pack/mods')
  const jar = readdirSync(mods).find(file => file.startsWith(namePrefix) && file.endsWith('.jar'))
  if (!jar) return undefined
  const out = join(cacheDir, basename(jar, '.jar'))
  if (!existsSync(out)) {
    mkdirSync(cacheDir, { recursive: true })
    rmSync(`${out}.partial`, { recursive: true, force: true })
    execFileSync('unzip', ['-q', '-o', join(mods, jar), 'data/*', 'assets/*', '-d', `${out}.partial`])
    renameSync(`${out}.partial`, out)
  }
  return out
}
