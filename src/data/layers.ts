import type { LayerData } from '../types/geo'

export const LAYERS = [
  {
    id: 'buildings',
    title: 'Bangunan',
    filename: 'BANGUNAN.geojson',
    description: 'Jejak area bangunan',
    icon: 'building',
    color: '#bc8252',
  },
  {
    id: 'lakes',
    title: 'Danau',
    filename: 'DANAU.geojson',
    description: 'Badan air dan danau',
    icon: 'water',
    color: '#429b9a',
  },
  {
    id: 'fishing',
    title: 'Perikanan tangkap',
    filename: 'DATA_PERIKANAN_TANGKAP.geojson',
    description: 'Lokasi dan data perikanan',
    icon: 'fish',
    color: '#d58a46',
  },
  {
    id: 'facilities',
    title: 'Fasilitas infrastruktur',
    filename: 'FASILITAS_INFRASTRUKTUR.geojson',
    description: 'Fasilitas umum dan infrastruktur',
    icon: 'facility',
    color: '#8172ad',
  },
  {
    id: 'roads',
    title: 'Jalan',
    filename: 'JALAN.geojson',
    description: 'Jaringan jalan',
    icon: 'road',
    color: '#71877a',
  },
  {
    id: 'tourism',
    title: 'Objek wisata',
    filename: 'ODTW.geojson',
    description: 'Objek daya tarik wisata',
    icon: 'tourism',
    color: '#cf6c68',
  },
] as const

export type { LayerData }
export type LayerId = (typeof LAYERS)[number]['id']

export const EMPTY_DATA = Object.fromEntries(
  LAYERS.map(({ id }) => [id, null]),
) as LayerData

function isFeatureCollection(value: unknown): value is LayerData[LayerId] {
  if (!value || typeof value !== 'object') return false
  const collection = value as { type?: unknown; features?: unknown }
  return collection.type === 'FeatureCollection' && Array.isArray(collection.features)
}

export async function loadGeoData(): Promise<LayerData> {
  const results = await Promise.all(
    LAYERS.map(async (layer) => {
      const response = await fetch(`/data/${layer.filename}`)
      if (!response.ok) {
        throw new Error(`Gagal memuat ${layer.filename} (HTTP ${response.status}).`)
      }

      const payload: unknown = await response.json()
      if (!isFeatureCollection(payload)) {
        throw new Error(`Format ${layer.filename} bukan GeoJSON FeatureCollection yang valid.`)
      }

      return [layer.id, payload] as const
    }),
  )

  return Object.fromEntries(results) as LayerData
}
