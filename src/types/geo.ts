import type { FeatureCollection, Geometry } from 'geojson'

export type GeoData = FeatureCollection<Geometry | null, Record<string, unknown>>

export type GeoRecord = {
  filename: string
  geojson: GeoData
  created_at: string
}
