import { copy, fill } from '#shared/copy'
import { habitatErrors, type Habitat } from '#shared/rules'

export default defineEventHandler(async (event) => {
  const oldId = getRouterParam(event, 'id')!
  const habitat = await readBody<Habitat>(event)
  const errors = habitatErrors(habitat)
  const habitats = readHabitats()
  if (habitat.id !== oldId && habitats.some(other => other.id === habitat.id)) {
    errors.push(fill(copy.server.habitatExists, { id: habitat.id }))
  }
  if (habitat.id !== oldId && allSpawnRefs().some(spawn => spawn.habitat === oldId)) {
    errors.push(fill(copy.server.habitatInUse, { id: oldId }))
  }
  if (errors.length > 0) {
    throw createError({ statusCode: 400, statusMessage: errors.join('; ') })
  }
  writeHabitat(habitat, habitats.some(other => other.id === oldId) ? oldId : undefined)
})
