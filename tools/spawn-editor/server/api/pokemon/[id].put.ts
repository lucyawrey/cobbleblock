import { join } from 'node:path'
import { isAllowed } from '#shared/rules'
import type { EditorSpawn } from '#shared/spawns'

export default defineEventHandler(async (event) => {
  const species = findSpecies(getRouterParam(event, 'id')!)
  const spawns = await readBody<EditorSpawn[]>(event)
  const habitats = readHabitats()
  for (const spawn of spawns) {
    const habitat = habitats.find(habitat => habitat.id === spawn.habitat)
    if (!habitat || !isAllowed(habitat, spawn.type)) {
      throw createError({ statusCode: 400, statusMessage: `${spawn.id}: ${spawn.habitat} doesn't allow ${spawn.type}` })
    }
  }
  writeJson(join(spawnDir, fileName(species)), {
    enabled: true,
    neededInstalledMods: [],
    neededUninstalledMods: [],
    spawns: spawns.map(spawn => toFile(species, spawn))
  })
  removeFile(draftPath(species))
})
