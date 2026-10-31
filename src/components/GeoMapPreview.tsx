import { useEffect } from 'react'
import L from 'leaflet'
import { GeoJSON, MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { LAYERS } from '../data/layers'
import type { LayerData } from '../types/geo'

function FitDataBounds({ data }: { data: LayerData }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([])
    for (const layer of LAYERS) {
      const collection = data[layer.id]
      if (collection) bounds.extend(L.geoJSON(collection).getBounds())
    }
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.1), { maxZoom: 15 })
  }, [data, map])

  return null
}

export function GeoMapPreview({ data }: { data: LayerData }) {
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
        {LAYERS.map((layer) => {
          const collection = data[layer.id]
          if (!collection) return null

          return (
            <GeoJSON
              key={layer.id}
              data={collection}
              style={() => ({
                color: layer.color,
                weight: layer.id === 'roads' ? 3 : 1.3,
                opacity: 0.9,
                fillColor: layer.color,
                fillOpacity: layer.id === 'lakes' ? 0.38 : 0.32,
              })}
              pointToLayer={(_, latlng) =>
                L.circleMarker(latlng, {
                  radius: 6,
                  color: '#fff',
                  weight: 2,
                  fillColor: layer.color,
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
