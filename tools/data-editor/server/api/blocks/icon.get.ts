import { blockIcon } from '../../utils/blocks'

export default defineEventHandler(event => blockIcon(String(getQuery(event).id)))
