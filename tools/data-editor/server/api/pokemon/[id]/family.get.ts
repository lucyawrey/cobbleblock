export default defineEventHandler((event) => {
  const species = findSpecies(getRouterParam(event, 'id')!)
  return family(species, String(getQuery(event).properties ?? ''))
})
