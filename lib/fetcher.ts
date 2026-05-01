/**
 * Shared SWR fetcher — throws on non-OK responses so SWR populates `error`.
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const info = await res.json().catch(() => ({}))
    const err: Error & { status?: number; info?: unknown } = new Error(
      info?.error ?? "Error al cargar los datos"
    )
    err.status = res.status
    err.info = info
    throw err
  }
  return res.json()
}
