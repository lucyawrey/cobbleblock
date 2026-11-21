export default defineEventHandler(event => pokemonModel(findSpecies(getRouterParam(event, 'id')!)) ?? null)
