import type { GeoData, GeoRecord } from '../types/geo'
import { isFeatureCollection } from '../data/layers'
import { supabase } from './supabase'

const TABLE_NAME = 'peta_spasial'
const RECORD_FIELDS = 'filename,geojson,created_at'

export async function loadGeoData(): Promise<GeoRecord[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(RECORD_FIELDS)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Gagal memuat data peta: ${error.message}`)
  if (!Array.isArray(data)) throw new Error('Respons data peta dari Supabase tidak valid.')

  return data.map((record: unknown) => {
    if (
      !record ||
      typeof record !== 'object' ||
      !('filename' in record) ||
      typeof record.filename !== 'string' ||
      !('created_at' in record) ||
      typeof record.created_at !== 'string' ||
      !('geojson' in record) ||
      !isFeatureCollection(record.geojson)
    ) {
      throw new Error('Ada baris data peta dengan format yang tidak valid.')
    }

    return {
      filename: record.filename,
      geojson: record.geojson,
      created_at: record.created_at,
    }
  })
}

export async function createGeoRecord(geojson: GeoData): Promise<void> {
  const { error } = await supabase.from(TABLE_NAME).insert({ geojson })
  if (error) throw new Error(`Gagal menambahkan GeoJSON: ${error.message}`)
}

export async function createGeoRecords(geojson: GeoData[]): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .insert(geojson.map((record) => ({ geojson: record })))
  if (error) throw new Error(`Gagal mengimpor GeoJSON: ${error.message}`)
}

export async function updateGeoRecord(filename: string, geojson: GeoData): Promise<void> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ geojson })
    .eq('filename', filename)
    .select('filename')
    .single()

  if (error) throw new Error(`Gagal memperbarui GeoJSON: ${error.message}`)
  if (!data) throw new Error('Data GeoJSON tidak ditemukan.')
}

export async function deleteGeoRecord(filename: string): Promise<void> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('filename', filename)
    .select('filename')
    .single()

  if (error) throw new Error(`Gagal menghapus GeoJSON: ${error.message}`)
  if (!data) throw new Error('Data GeoJSON tidak ditemukan.')
}
