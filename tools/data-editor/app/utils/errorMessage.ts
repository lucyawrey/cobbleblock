export function errorMessage(error: unknown) {
  return (error as { data?: { statusMessage?: string } }).data?.statusMessage ?? String(error)
}
