export default defineEventHandler((event) => {
  const species = findSpecies(getRouterParam(event, 'id')!)
  return {
    species,
    ...editorSpawns(species),
    base: baseSpawns(species),
    sheet: sheetRows(species),
    pack: packSpawns(species)
  }
})
