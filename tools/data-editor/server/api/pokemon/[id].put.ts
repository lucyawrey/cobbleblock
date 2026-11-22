import { copy, fill } from '#shared/copy'
import { isAllowed } from '#shared/rules'
import type { EditorSpawn } from '#shared/spawns'

export default defineEventHandler(async (event) => {
  const species = findSpecies(getRouterParam(event, 'id')!)
  const spawns = await readBody<EditorSpawn[]>(event)
  const habitats = readHabitats()
  for (const spawn of spawns) {
    const habitat = habitats.find(habitat => habitat.id === spawn.habitat)
    if (!habitat || !isAllowed(habitat, spawn.type)) {
      throw createError({ statusCode: 400, statusMessage: fill(copy.server.typeNotAllowed, { spawn: spawn.id, habitat: spawn.habitat, type: spawn.type }) })
    }
  }
  writePack(species, spawns)
  removeFile(draftPath(species))
  saveLinks(species, spawns)
})
