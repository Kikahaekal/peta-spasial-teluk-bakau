import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { LAYERS } from '../data/layers'
import type { LayerData, LayerId } from '../types/geo'
import { Icon } from './Icon'

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

const CATEGORY_FIELDS: Partial<Record<LayerId, string>> = {
  fishing: 'Alat_Tangk',
  facilities: 'Kelas',
  roads: 'REMARK',
  tourism: 'REMARK',
}

const PROPERTY_LABELS: Record<string, string> = {
  Alat_Tangk: 'Alat tangkap',
  area_m2: 'Perkiraan luas',
  Id: 'ID data',
  Jenis_Tang: 'Jenis hasil tangkapan',
  Jenis_Ukur: 'Ukuran ikan',
  Kelas: 'Jenis fasilitas',
  Kondisi: 'Kondisi',
  Lama_Opera: 'Lama operasi',
  Name: 'Nama',
  No_: 'Nomor data',
  Panjang_m_: 'Panjang jalan',
  REMARK: 'Jenis / keterangan',
  Jumlah_Tan: 'Jumlah tangkapan',
}

function readableValue(key: string, value: unknown) {
  if (key === 'area_m2' && typeof value === 'number') {
    return `${formatNumber(Number(value.toFixed(2)))} m²`
  }
  if (key === 'Panjang_m_' && typeof value === 'number') {
    return `${formatNumber(Number(value.toFixed(2)))} meter`
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function popupContent(
  feature: Feature<Geometry | null, Record<string, unknown>>,
  layerId: LayerId,
  layerTitle: string,
) {
  const properties = feature.properties ?? {}
  const name = properties.Name
  const titleValue = typeof name === 'string' && name.trim() && Number.isNaN(Number(name))
    ? name
    : properties[CATEGORY_FIELDS[layerId] ?? ''] ?? properties.Kelas ?? properties.REMARK ?? properties.label
  const title = typeof titleValue === 'string' && titleValue.trim() ? titleValue : layerTitle
  const entries = Object.entries(properties)
    .filter(([key, value]) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== '-' &&
      !['X', 'Y', 'fid_1', 'Id', 'SHAPE_Leng'].includes(key) &&
      key !== 'label' &&
      !(['Kelas', 'REMARK', 'Alat_Tangk'].includes(key) && value === title) &&
      !(key === 'Name' && typeof value === 'string' && value === title),
    )
    .slice(0, 8)

  if (typeof name === 'number' || (typeof name === 'string' && !Number.isNaN(Number(name)))) {
    entries.unshift(['No_', name])
  }

  return `
    <div class="map-popup">
      <span class="map-popup__category">${escapeHtml(layerTitle)}</span>
      <h3 class="map-popup__title">${escapeHtml(title)}</h3>
      ${entries.length ? `<dl class="map-popup__details">${entries.map(([key, value]) => {
        const label = PROPERTY_LABELS[key] ?? key.replaceAll('_', ' ')
        return `<div class="map-popup__row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(readableValue(key, value))}</dd></div>`
      }).join('')}</dl>` : '<p class="map-popup__empty">Tidak ada informasi tambahan.</p>'}
    </div>
  `
}

function pointMarkerIcon(layerId: LayerId, color: string) {
  const drawings: Partial<Record<LayerId, string>> = {
    facilities: '<path d="M3 19h18M5 19V9l7-5 7 5v10M9 19v-5h6v5M9 10h.01M15 10h.01"/>',
    fishing: '<path d="M3 12s3-5 9-5c3 0 5 1.7 7 5-2 3.3-4 5-7 5-6 0-9-5-9-5Z"/><path d="m3 12-2-3 4 1m-2 2-2 3 4-1m8-3h.01"/>',
    tourism: '<path d="M3 19h18M5 19l2-8 5-3 5 3 2 8M9 19v-4h6v4M12 8V3m-3 3 3-3 3 3"/>',
  }
  const drawing = drawings[layerId] ?? '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>'

  return L.divIcon({
    className: 'map-point-icon',
    html: `<span class="map-marker" style="--marker-color:${color}"><svg viewBox="0 0 24 24" aria-hidden="true">${drawing}</svg></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
  })
}

function MapEffects({
  data,
  mapRef,
  boundsRef,
}: {
  data: LayerData
  mapRef: React.RefObject<L.Map | null>
  boundsRef: React.RefObject<L.LatLngBounds | null>
}) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    const bounds = L.latLngBounds([])

    for (const layer of LAYERS) {
      const layerData = data[layer.id]
      if (layerData) bounds.extend(L.geoJSON(layerData).getBounds())
    }

    boundsRef.current = bounds.isValid() ? bounds.pad(0.08) : null
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.08), { maxZoom: 16 })

    return () => {
      mapRef.current = null
      boundsRef.current = null
    }
  }, [data, map, mapRef, boundsRef])

  return null
}

export function MapPage({ data, error }: { data: LayerData; error: string | null }) {
  const [activeLayers, setActiveLayers] = useState<LayerId[]>(LAYERS.map(({ id }) => id))
  const [hiddenCategories, setHiddenCategories] = useState<Partial<Record<LayerId, string[]>>>({})
  const [expandedCategories, setExpandedCategories] = useState<LayerId[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)

  const categoryOptions = useMemo(() => {
    const options: Partial<Record<LayerId, { field: string; values: { value: string; count: number }[] }>> = {}

    for (const layer of LAYERS) {
      const field = CATEGORY_FIELDS[layer.id]
      const features = data[layer.id]?.features
      if (!field || !features) continue

      const counts = new Map<string, number>()
      for (const feature of features) {
        const value = feature.properties?.[field]
        if (typeof value !== 'string' || !value.trim()) continue
        counts.set(value, (counts.get(value) ?? 0) + 1)
      }

      options[layer.id] = {
        field,
        values: [...counts.entries()]
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => a.value.localeCompare(b.value, 'id')),
      }
    }

    return options
  }, [data])

  const matchesCategory = useCallback((layerId: LayerId, properties: Record<string, unknown>) => {
    const field = categoryOptions[layerId]?.field
    if (!field) return true
    const value = properties[field]
    return typeof value === 'string' && !hiddenCategories[layerId]?.includes(value)
  }, [categoryOptions, hiddenCategories])

  const visibleCounts = useMemo(() => {
    return LAYERS.reduce((total, layer) => {
      if (!activeLayers.includes(layer.id)) return total
      const features = data[layer.id]?.features ?? []
      return total + features.filter((feature) => matchesCategory(layer.id, feature.properties ?? {})).length
    }, 0)
  }, [activeLayers, data, matchesCategory])

  const toggleLayer = (id: LayerId) => {
    setActiveLayers((current) =>
      current.includes(id) ? current.filter((layer) => layer !== id) : [...current, id],
    )
  }

  const toggleCategory = (id: LayerId, value: string) => {
    setHiddenCategories((current) => {
      const hidden = current[id] ?? []
      const updated = hidden.includes(value)
        ? hidden.filter((category) => category !== value)
        : [...hidden, value]
      return { ...current, [id]: updated }
    })
  }

  const toggleCategoryExpansion = (id: LayerId) => {
    setExpandedCategories((current) =>
      current.includes(id) ? current.filter((layer) => layer !== id) : [...current, id],
    )
  }

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-[#dce6e3]">
        <MapContainer
          center={[1.066, 104.66]}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEffects data={data} mapRef={mapRef} boundsRef={boundsRef} />
          {LAYERS.map((layer) => {
            const collection = data[layer.id]
            if (!collection || !activeLayers.includes(layer.id)) return null
            return (
              <GeoJSON
                key={layer.id}
                data={collection}
                filter={(feature) => matchesCategory(layer.id, feature.properties ?? {})}
                style={() => ({
                  color: layer.color,
                  weight: layer.id === 'roads' ? 3 : 1.3,
                  opacity: layer.id === 'roads' ? 0.82 : 0.88,
                  fillColor: layer.color,
                  fillOpacity: layer.id === 'lakes' ? 0.32 : layer.id === 'buildings' ? 0.28 : 0.38,
                })}
                pointToLayer={(_, latlng) =>
                  L.marker(latlng, { icon: pointMarkerIcon(layer.id, layer.color) })
                }
                onEachFeature={(feature, leafletLayer) =>
                  leafletLayer.bindPopup(popupContent(feature, layer.id, layer.title))
                }
              />
            )
          })}
        </MapContainer>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start gap-2 p-3 sm:gap-3 sm:p-5">
          <a
            href="/"
            className="pointer-events-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 text-[11px] font-semibold text-[#24565B] shadow-[0_4px_18px_-8px_rgba(36,86,91,0.4)] transition-colors hover:bg-white sm:h-11 sm:px-4"
          >
            <span aria-hidden="true" className="text-[17px] leading-none">←</span>
            <span>Kembali</span>
          </a>

          <div className="pointer-events-auto ml-auto flex shrink-0 flex-col gap-2">
            <div className="flex flex-col overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-[0_4px_18px_-8px_rgba(11,60,73,0.4)]">
              <button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Perbesar peta" className="flex h-12 w-12 items-center justify-center text-[#24565B] transition-colors hover:bg-[#edf2ef] sm:h-14 sm:w-14">
                <Icon name="plus" size={22} />
              </button>
              <span className="mx-2 border-t border-[#e7ece9]" />
              <button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Perkecil peta" className="flex h-12 w-12 items-center justify-center text-[#24565B] transition-colors hover:bg-[#edf2ef] sm:h-14 sm:w-14">
                <Icon name="minus" size={22} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-expanded={sidebarOpen}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/95 px-3 text-[11px] font-semibold text-[#24565B] shadow-[0_4px_18px_-8px_rgba(36,86,91,0.4)] transition-colors hover:bg-[#edf2ef] sm:h-11 sm:px-4"
            >
              <Icon name={sidebarOpen ? 'close' : 'layers'} size={17} />
              {sidebarOpen ? 'Tutup' : 'Lapisan'}
            </button>
          </div>
        </div>

        <aside className={`absolute right-3 top-[153px] z-[600] flex max-h-[min(65%,520px)] w-[min(320px,calc(100%-24px))] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_14px_40px_-18px_rgba(11,60,73,0.45)] backdrop-blur transition-all sm:right-5 sm:top-[169px] ${sidebarOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'}`}>
          <div className="flex items-center justify-between border-b border-[#e8eeeb] px-4 py-3">
            <div>
              <h1 className="text-[13px] font-semibold text-[#24565B]">Lapisan peta</h1>
              <p className="mt-0.5 text-[10px] text-[#7c908d]">{formatNumber(visibleCounts)} objek ditampilkan</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveLayers(activeLayers.length === LAYERS.length ? [] : LAYERS.map(({ id }) => id))}
              className="text-[10px] font-semibold text-[#567a77] hover:text-[#24565B]"
            >
              {activeLayers.length === LAYERS.length ? 'Matikan semua' : 'Aktifkan semua'}
            </button>
          </div>
          <div className="overflow-y-auto p-2">
            {LAYERS.map((layer) => {
              const active = activeLayers.includes(layer.id)
              const count = data[layer.id]?.features.length ?? 0
              const categories = categoryOptions[layer.id]
              const expanded = expandedCategories.includes(layer.id)
              return (
                <div key={layer.id}>
                  <div className={`flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${active ? 'bg-[#f2f6f3]' : 'hover:bg-[#f7f9f7]'}`}>
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1">
                      <input type="checkbox" checked={active} onChange={() => toggleLayer(layer.id)} className="sr-only" />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ color: layer.color, backgroundColor: `${layer.color}18` }}>
                        <Icon name={layer.icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#355b5c]">{layer.title}</span>
                      <span className="text-[10px] tabular-nums text-[#819490]">{formatNumber(count)}</span>
                      <span aria-hidden="true" className={`relative h-[17px] w-[30px] shrink-0 rounded-full transition-colors ${active ? 'bg-[#24565B]' : 'bg-[#d8e1dd]'}`}>
                        <span className={`absolute top-[3px] h-[11px] w-[11px] rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-[3px]'}`} />
                      </span>
                    </label>
                    {categories && (
                      <button
                        type="button"
                        aria-label={`${expanded ? 'Tutup' : 'Buka'} kategori ${layer.title}`}
                        aria-expanded={expanded}
                        onClick={() => toggleCategoryExpansion(layer.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#68817c] hover:bg-white"
                      >
                        <Icon name="chevron" size={15} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>
                  {categories && expanded && (
                    <div className="ml-6 border-l border-[#e4ece8] py-1 pl-3">
                      {categories.values.map(({ value, count: categoryCount }) => {
                        const checked = !hiddenCategories[layer.id]?.includes(value)
                        return (
                          <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-[10px] text-[#526c68] hover:bg-[#f5f8f6]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(layer.id, value)}
                              className="h-3.5 w-3.5 accent-[#24565B]"
                            />
                            <span className="min-w-0 flex-1">{value}</span>
                            <span className="tabular-nums text-[#819490]">{formatNumber(categoryCount)}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {error && <p role="alert" className="border-t border-[#e8eeeb] px-4 py-2 text-[10px] text-[#9b574d]">{error}</p>}
        </aside>

        <div className="pointer-events-none absolute bottom-3 right-3 z-[400] rounded-full bg-white/80 px-2.5 py-1 text-[9px] text-[#587070] backdrop-blur-sm sm:bottom-4 sm:right-4">
          Desa Teluk Bakau · {formatNumber(visibleCounts)} objek
        </div>
    </main>
  )
}
