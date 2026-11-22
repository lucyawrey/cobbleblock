export default defineEventHandler((event) => {
  const species = findSpecies(getRouterParam(event, 'id')!)
  const { status, spawns } = editorSpawns(species)
  return {
    species,
    status,
    spawns: withLinks(species, spawns),
    base: baseSpawns(species),
    sheet: sheetRows(species),
    pack: packSpawns(species)
  }
})
