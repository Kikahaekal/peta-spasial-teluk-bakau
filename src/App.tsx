import { useEffect, useState } from 'react'
import { loadGeoData } from './lib/geoRecords'
import type { GeoRecord } from './types/geo'
import { LandingPage } from './components/LandingPage'
import { MapPage } from './components/MapPage'
import { AdminPage } from './components/AdminPage'

function App() {
  const [data, setData] = useState<GeoRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const mapPage = path === '/peta'
  const adminPage = path === '/admin'

  useEffect(() => {
    if (adminPage) return

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
  }, [adminPage])

  if (adminPage) return <AdminPage />
  if (mapPage) return <MapPage data={data} error={error} />
  return <LandingPage data={data} error={error ?? (loading ? 'Memuat data spasial...' : null)} />
}

export default App
