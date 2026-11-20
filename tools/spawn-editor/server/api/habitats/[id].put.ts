import { habitatErrors, type Habitat } from '#shared/rules'

export default defineEventHandler(async (event) => {
  const oldId = getRouterParam(event, 'id')!
  const habitat = await readBody<Habitat>(event)
  const errors = habitatErrors(habitat)
  const habitats = readHabitats()
  if (habitat.id !== oldId && habitats.some(other => other.id === habitat.id)) {
    errors.push(`${habitat.id} already exists`)
  }
  if (habitat.id !== oldId && allSpawnRefs().some(spawn => spawn.habitat === oldId)) {
    errors.push(`spawns use ${oldId}, so it can't be renamed`)
  }
  if (errors.length > 0) {
    throw createError({ statusCode: 400, statusMessage: errors.join('; ') })
  }
  writeHabitat(habitat, habitats.some(other => other.id === oldId) ? oldId : undefined)
})
