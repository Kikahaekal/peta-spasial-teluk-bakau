import { useEffect } from 'react'
import L from 'leaflet'
import { GeoJSON, MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { LAYER_COLORS } from '../data/layers'
import type { GeoRecord } from '../types/geo'

function FitDataBounds({ data }: { data: GeoRecord[] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([])
    for (const record of data) {
      bounds.extend(L.geoJSON(record.geojson).getBounds())
    }
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.1), { maxZoom: 15 })
  }, [data, map])

  return null
}

export function GeoMapPreview({ data }: { data: GeoRecord[] }) {
  return (
    <div className="relative isolate h-full min-h-[280px] w-full overflow-hidden bg-[#dce8db]">
      <MapContainer
        center={[1.066, 104.66]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={false}
        className="z-0"
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitDataBounds data={data} />
        {data.map((record, index) => {
          const color = LAYER_COLORS[index % LAYER_COLORS.length]
          return (
            <GeoJSON
              key={record.filename}
              data={record.geojson}
              style={() => ({
                color,
                weight: 1.6,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: 0.32,
              })}
              pointToLayer={(_, latlng) =>
                L.circleMarker(latlng, {
                  radius: 6,
                  color: '#fff',
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 1,
                })
              }
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
