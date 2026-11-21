import copy from '../copy.json'

export { copy }

export function fill(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]))
}
