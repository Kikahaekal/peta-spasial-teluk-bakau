import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { IMPORT_FILES, isFeatureCollection, readPublicGeoJson } from '../data/layers'
import {
  createGeoRecord,
  createGeoRecords,
  deleteGeoRecord,
  loadGeoData,
  updateGeoRecord,
} from '../lib/geoRecords'
import { supabase } from '../lib/supabase'
import type { GeoData, GeoRecord } from '../types/geo'

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.'
}

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [records, setRecords] = useState<GeoRecord[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState('{\n  "type": "FeatureCollection",\n  "features": []\n}')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isAdmin = session?.user.app_metadata.role === 'admin'

  useEffect(() => {
    let active = true
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession)
        if (nextSession?.user.app_metadata.role !== 'admin') setRecords([])
        setCheckingSession(false)
        setError(null)
      }
    })

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(`Gagal memeriksa sesi: ${sessionError.message}`)
      setSession(data.session)
      setCheckingSession(false)
    }).catch((sessionError: unknown) => {
      if (!active) return
      setError(`Gagal memeriksa sesi: ${getErrorMessage(sessionError)}`)
      setCheckingSession(false)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    let active = true
    loadGeoData()
      .then((loadedRecords) => {
        if (active) setRecords(loadedRecords)
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  const resetEditor = () => {
    setSelectedId(null)
    setEditor('{\n  "type": "FeatureCollection",\n  "features": []\n}')
  }

  const refreshRecords = async () => {
    const loadedRecords = await loadGeoData()
    setRecords(loadedRecords)
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) throw loginError
    } catch (loginError: unknown) {
      setError(`Login gagal: ${getErrorMessage(loginError)}`)
    } finally {
      setBusy(false)
    }
  }

  const parseEditor = (): GeoData => {
    let parsed: unknown
    try {
      parsed = JSON.parse(editor)
    } catch {
      throw new Error('JSON tidak valid. Periksa kembali isi GeoJSON.')
    }
    if (!isFeatureCollection(parsed)) {
      throw new Error('GeoJSON harus berupa FeatureCollection dengan daftar features.')
    }
    return parsed
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const geojson = parseEditor()
      if (selectedId) {
        await updateGeoRecord(selectedId, geojson)
        setNotice('GeoJSON berhasil diperbarui.')
      } else {
        await createGeoRecord(geojson)
        setNotice('GeoJSON berhasil ditambahkan.')
      }
      await refreshRecords()
      resetEditor()
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError))
    } finally {
      setBusy(false)
    }
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setNotice(null)
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isFeatureCollection(parsed)) {
        throw new Error('Berkas harus berisi GeoJSON FeatureCollection.')
      }
      setEditor(JSON.stringify(parsed, null, 2))
      setSelectedId(null)
    } catch (fileError: unknown) {
      setError(`Berkas tidak dapat dibaca: ${getErrorMessage(fileError)}`)
    }
  }

  const handleDelete = async (record: GeoRecord) => {
    if (!window.confirm(`Hapus GeoJSON ${record.filename}? Tindakan ini tidak dapat dibatalkan.`)) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await deleteGeoRecord(record.filename)
      setRecords((current) => current.filter(({ filename }) => filename !== record.filename))
      if (selectedId === record.filename) resetEditor()
      setNotice('GeoJSON berhasil dihapus.')
    } catch (deleteError: unknown) {
      setError(getErrorMessage(deleteError))
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async () => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const geojson = await Promise.all(IMPORT_FILES.map(readPublicGeoJson))
      await createGeoRecords(geojson)
      await refreshRecords()
      setNotice(`${geojson.length} berkas GeoJSON berhasil diimpor.`)
    } catch (importError: unknown) {
      setError(getErrorMessage(importError))
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    setError(null)
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError(`Gagal keluar: ${logoutError.message}`)
  }

  return (
    <main className="min-h-screen bg-[#f5f8f6] px-4 py-8 text-[#24565B] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/" className="text-sm font-semibold text-[#567a77] hover:text-[#24565B]">← Beranda</a>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin data spasial</h1>
            <p className="mt-1 text-sm text-[#718783]">Kelola GeoJSON yang tersimpan di Supabase.</p>
          </div>
          {session && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#d5e2dc] bg-white px-4 py-2 text-sm font-medium hover:bg-[#edf2ef]"
            >
              Keluar
            </button>
          )}
        </header>

        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

        {checkingSession ? (
          <p className="rounded-xl bg-white p-6 text-sm text-[#718783]">Memeriksa sesi admin...</p>
        ) : !session ? (
          <form onSubmit={handleLogin} className="mx-auto grid max-w-md gap-4 rounded-2xl border border-[#dce3de] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Login admin</h2>
            <label className="grid gap-1.5 text-sm font-medium">
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-[#d5e2dc] px-3 py-2.5 font-normal outline-none focus:border-[#397e78]"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Kata sandi
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-[#d5e2dc] px-3 py-2.5 font-normal outline-none focus:border-[#397e78]"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#24565B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#19454a] disabled:opacity-60"
            >
              {busy ? 'Memproses...' : 'Masuk'}
            </button>
            <p className="text-xs leading-relaxed text-[#718783]">
              Akun harus memiliki role <code>admin</code> pada Supabase App Metadata.
            </p>
          </form>
        ) : !isAdmin ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Akun ini berhasil login, tetapi tidak memiliki akses admin. Minta administrator proyek untuk menetapkan
            role <code>admin</code> pada App Metadata akun Anda.
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
            <section className="rounded-2xl border border-[#dce3de] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Data tersimpan</h2>
                  <p className="text-xs text-[#718783]">{records.length} GeoJSON</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {records.length === 0 && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleImport}
                      className="rounded-lg border border-[#b8d2cb] px-3 py-2 text-xs font-semibold text-[#24565B] hover:bg-[#f2f6f3] disabled:opacity-60"
                    >
                      Impor 6 data publik
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="rounded-lg bg-[#24565B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#19454a]"
                  >
                    Tambah GeoJSON
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                {records.map((record) => (
                  <article key={record.filename} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4ece8] p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(record.filename)
                        setEditor(JSON.stringify(record.geojson, null, 2))
                        setError(null)
                        setNotice(null)
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate font-mono text-xs font-semibold">{record.filename}</span>
                      <span className="mt-1 block text-[11px] text-[#718783]">
                        {record.geojson.features.length} fitur · {new Date(record.created_at).toLocaleString('id-ID')}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleDelete(record)}
                      className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Hapus
                    </button>
                  </article>
                ))}
                {records.length === 0 && (
                  <p className="rounded-xl bg-[#f7f9f7] p-5 text-sm text-[#718783]">
                    Belum ada data. Impor data publik atau tambahkan berkas GeoJSON.
                  </p>
                )}
              </div>
            </section>

            <form onSubmit={handleSave} className="flex flex-col rounded-2xl border border-[#dce3de] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{selectedId ? 'Edit GeoJSON' : 'Tambah GeoJSON'}</h2>
                {selectedId && <p className="mt-1 break-all font-mono text-[11px] text-[#718783]">{selectedId}</p>}
              </div>
              <label className="mb-3 grid gap-1.5 text-xs font-semibold">
                Pilih berkas .geojson (opsional)
                <input
                  type="file"
                  accept=".geojson,.json,application/geo+json,application/json"
                  disabled={busy}
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                  className="w-full rounded-lg border border-[#d5e2dc] p-2 text-xs font-normal"
                />
              </label>
              <label className="grid flex-1 gap-1.5 text-xs font-semibold">
                Isi GeoJSON
                <textarea
                  required
                  value={editor}
                  onChange={(event) => setEditor(event.target.value)}
                  spellCheck={false}
                  className="min-h-[360px] w-full resize-y rounded-lg border border-[#d5e2dc] p-3 font-mono text-[11px] leading-relaxed outline-none focus:border-[#397e78]"
                />
              </label>
              <p className="my-3 text-[11px] leading-relaxed text-[#718783]">
                Nama file di database dibuat otomatis sebagai UUID. Yang disimpan hanya isi FeatureCollection pada kolom <code>geojson</code>.
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[#24565B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#19454a] disabled:opacity-60"
                >
                  {busy ? 'Menyimpan...' : selectedId ? 'Simpan perubahan' : 'Simpan data'}
                </button>
                {selectedId && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={resetEditor}
                    className="rounded-lg border border-[#d5e2dc] px-4 py-2.5 text-sm font-medium hover:bg-[#f2f6f3] disabled:opacity-60"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
