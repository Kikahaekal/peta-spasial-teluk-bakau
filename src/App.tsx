import { useEffect, useState } from 'react'
import { EMPTY_DATA, loadGeoData } from './data/layers'
import type { LayerData } from './types/geo'
import { LandingPage } from './components/LandingPage'
import { MapPage } from './components/MapPage'

function App() {
  const [data, setData] = useState<LayerData>(EMPTY_DATA)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mapPage = window.location.pathname.replace(/\/+$/, '') === '/peta'

  useEffect(() => {
    let isMounted = true
    loadGeoData()
      .then((loadedData) => {
        if (isMounted) setData(loadedData)
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Data GeoJSON tidak dapat dimuat.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (mapPage) return <MapPage data={data} error={error} />
  return <LandingPage data={data} error={error ?? (loading ? 'Memuat data spasial...' : null)} />
}

export default App
