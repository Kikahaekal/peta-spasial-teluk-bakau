import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { LAYER_COLORS } from '../data/layers'
import type { GeoRecord } from '../types/geo'
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

function popupContent(
  feature: Feature<Geometry | null, Record<string, unknown>>,
  layerTitle: string,
) {
  const properties = feature.properties ?? {}
  const name = properties.Name
  const title = typeof name === 'string' && name.trim() && Number.isNaN(Number(name))
    ? name
    : layerTitle
  const entries = Object.entries(properties)
    .filter(([key, value]) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== '-' &&
      !['X', 'Y', 'fid_1', 'Id', 'SHAPE_Leng'].includes(key) &&
      key !== 'label',
    )
    .slice(0, 8)

  return `
    <div class="map-popup">
      <span class="map-popup__category">Data GeoJSON</span>
      <h3 class="map-popup__title">${escapeHtml(title)}</h3>
      ${entries.length ? `<dl class="map-popup__details">${entries.map(([key, value]) => {
        const label = key.replaceAll('_', ' ')
        const readable = typeof value === 'object' ? JSON.stringify(value) : String(value)
        return `<div class="map-popup__row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(readable)}</dd></div>`
      }).join('')}</dl>` : '<p class="map-popup__empty">Tidak ada informasi tambahan.</p>'}
    </div>
  `
}

function pointMarkerIcon(color: string, properties: Record<string, unknown> | null) {
  const drawings: Partial<Record<string, string>> = {
    Alat_Tangk: '<path d="M3 12s3-5 9-5c3 0 5 1.7 7 5-2 3.3-4 5-7 5-6 0-9-5-9-5Z"/><path d="m3 12-2-3 4 1m-2 2-2 3 4-1m8-3h.01"/>',
    Kelas: '<path d="M3 19h18M5 19V9l7-5 7 5v10M9 19v-5h6v5M9 10h.01M15 10h.01"/>',
    REMARK: '<path d="M3 19h18M5 19l2-8 5-3 5 3 2 8M9 19v-4h6v4M12 8V3m-3 3 3-3 3 3"/>',
  }
  const drawing = Object.keys(properties ?? {}).map((key) => drawings[key]).find(Boolean)
    ?? '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>'

  return L.divIcon({
    className: 'map-point-icon',
    html: `<span class="map-marker" style="--marker-color:${color}"><svg viewBox="0 0 24 24" aria-hidden="true">${drawing}</svg></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -42],
  })
}

function MapEffects({ data }: { data: GeoRecord[] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([])
    for (const record of data) {
      bounds.extend(L.geoJSON(record.geojson).getBounds())
    }
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.08), { maxZoom: 16 })
  }, [data, map])

  return null
}

export function MapPage({ data, error }: { data: GeoRecord[]; error: string | null }) {
  const [visibleIds, setVisibleIds] = useState<string[] | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const allIds = useMemo(() => data.map(({ filename }) => filename), [data])
  const visibleCount = useMemo(
    () => data.reduce(
      (total, record) => visibleIds === null || visibleIds.includes(record.filename)
        ? total + record.geojson.features.length
        : total,
      0,
    ),
    [data, visibleIds],
  )

  const toggleLayer = (filename: string) => {
    setVisibleIds((current) => {
      const visible = current ?? allIds
      return visible.includes(filename)
        ? visible.filter((id) => id !== filename)
        : [...visible, filename]
    })
  }

  const allVisible = visibleIds === null || visibleIds.length === allIds.length

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-[#dce6e3]">
      <MapContainer
        center={[1.066, 104.66]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom
        className="z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEffects data={data} />
        {data.map((record, index) => {
          if (visibleIds !== null && !visibleIds.includes(record.filename)) return null
          const color = LAYER_COLORS[index % LAYER_COLORS.length]
          const title = `Data ${record.filename.slice(0, 8)}`
          return (
            <GeoJSON
              key={record.filename}
              data={record.geojson}
              style={() => ({
                color,
                weight: 1.6,
                opacity: 0.88,
                fillColor: color,
                fillOpacity: 0.34,
              })}
              pointToLayer={(feature, latlng) =>
                L.marker(latlng, { icon: pointMarkerIcon(color, feature.properties) })
              }
              onEachFeature={(feature, leafletLayer) =>
                leafletLayer.bindPopup(popupContent(feature, title))
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

        <div className="pointer-events-auto ml-auto flex shrink-0 flex-col items-end gap-2">
          <div className="flex flex-col overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-[0_4px_18px_-8px_rgba(11,60,73,0.4)]">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Perbesar peta"
              className="flex h-9 w-9 items-center justify-center text-[#24565B] transition-colors hover:bg-[#edf2ef]"
            >
              <Icon name="plus" size={16} />
            </button>
            <span className="mx-2 border-t border-[#e7ece9]" />
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Perkecil peta"
              className="flex h-9 w-9 items-center justify-center text-[#24565B] transition-colors hover:bg-[#edf2ef]"
            >
              <Icon name="minus" size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Tutup lapisan peta' : 'Buka lapisan peta'}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 px-2 text-[#24565B] shadow-[0_4px_18px_-8px_rgba(36,86,91,0.4)] transition-colors hover:bg-[#edf2ef]"
          >
            <Icon name={sidebarOpen ? 'close' : 'layers'} size={17} />
          </button>
        </div>
      </div>

      <aside className={`absolute right-3 top-[153px] z-[600] flex max-h-[min(65%,520px)] w-[min(320px,calc(100%-24px))] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_14px_40px_-18px_rgba(11,60,73,0.45)] backdrop-blur transition-all sm:right-5 sm:top-[169px] ${sidebarOpen ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'}`}>
        <div className="flex items-center justify-between border-b border-[#e8eeeb] px-4 py-3">
          <div>
            <h1 className="text-[13px] font-semibold text-[#24565B]">Lapisan peta</h1>
            <p className="mt-0.5 text-[10px] text-[#7c908d]">{formatNumber(visibleCount)} objek ditampilkan</p>
          </div>
          <button
            type="button"
            onClick={() => setVisibleIds(allVisible ? [] : null)}
            className="text-[10px] font-semibold text-[#567a77] hover:text-[#24565B]"
          >
            {allVisible ? 'Matikan semua' : 'Aktifkan semua'}
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {data.map((record, index) => {
            const active = visibleIds === null || visibleIds.includes(record.filename)
            const color = LAYER_COLORS[index % LAYER_COLORS.length]
            return (
              <label key={record.filename} className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-[#f2f6f3]">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleLayer(record.filename)}
                  className="h-4 w-4 accent-[#24565B]"
                />
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#355b5c]">
                  {record.filename}
                </span>
                <span className="text-[10px] tabular-nums text-[#819490]">
                  {formatNumber(record.geojson.features.length)}
                </span>
              </label>
            )
          })}
          {data.length === 0 && !error && (
            <p className="px-3 py-4 text-[11px] text-[#718783]">Belum ada data GeoJSON.</p>
          )}
        </div>
        {error && <p role="alert" className="border-t border-[#e8eeeb] px-4 py-2 text-[10px] text-[#9b574d]">{error}</p>}
      </aside>

      <div className="pointer-events-none absolute bottom-3 right-3 z-[400] rounded-full bg-white/80 px-2.5 py-1 text-[9px] text-[#587070] backdrop-blur-sm sm:bottom-4 sm:right-4">
        Desa Teluk Bakau · {formatNumber(visibleCount)} objek
      </div>
    </main>
  )
}
