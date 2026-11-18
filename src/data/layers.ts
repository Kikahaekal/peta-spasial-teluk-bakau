import type { GeoData } from '../types/geo'

export const IMPORT_FILES = [
  'BANGUNAN.geojson',
  'DANAU.geojson',
  'DATA_PERIKANAN_TANGKAP.geojson',
  'FASILITAS_INFRASTRUKTUR.geojson',
  'JALAN.geojson',
  'ODTW.geojson',
]

export const LAYER_COLORS = [
  '#bc8252',
  '#429b9a',
  '#d58a46',
  '#8172ad',
  '#71877a',
  '#cf6c68',
]

export function isFeatureCollection(value: unknown): value is GeoData {
  if (!value || typeof value !== 'object') return false
  const collection = value as { type?: unknown; features?: unknown }
  return collection.type === 'FeatureCollection' && Array.isArray(collection.features)
}

export async function readPublicGeoJson(filename: string): Promise<GeoData> {
  const response = await fetch(`/data/${filename}`)
  if (!response.ok) {
    throw new Error(`Gagal membaca ${filename} (HTTP ${response.status}).`)
  }

  const payload: unknown = await response.json()
  if (!isFeatureCollection(payload)) {
    throw new Error(`Format ${filename} bukan GeoJSON FeatureCollection yang valid.`)
  }

  return payload
}
