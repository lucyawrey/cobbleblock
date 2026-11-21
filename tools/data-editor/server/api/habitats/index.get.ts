import type { HabitatData } from '#shared/spawns'

export default defineEventHandler((): HabitatData => ({ habitats: readHabitats(), spawns: allSpawnRefs() }))
