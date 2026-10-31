import type { FeatureCollection, Geometry } from 'geojson'

export type LayerId =
  | 'buildings'
  | 'lakes'
  | 'fishing'
  | 'facilities'
  | 'roads'
  | 'tourism'

export type GeoData = FeatureCollection<Geometry | null, Record<string, unknown>>
export type LayerData = Record<LayerId, GeoData | null>
