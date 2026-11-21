export default defineEventHandler(() =>
  allSpecies().map(species => ({ ...species, status: editorSpawns(species).status }))
)
