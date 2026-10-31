import type { LayerData } from '../types/geo'
import { Icon } from './Icon'
import { GeoMapPreview } from './GeoMapPreview'
import { SiteHeader } from './SiteHeader'
import maritim_image from '../../public/img/maritim.jpg'
import logo_umrah from '../../public/img/logo-umrah.png'
import logo_bintan from '../../public/img/logo-bintan.png'

function LogoPlaceholder({ label, img }: { label: string, img: string }) {
  return (
    <div className="flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg text-white/80">
      <img src={img} alt={label} />
      <span className="text-[7px] font-semibold uppercase tracking-[0.08em]">{label}</span>
    </div>
  )
}

export function LandingPage({ data, error }: { data: LayerData; error: string | null }) {
  return (
    <div className="min-h-screen bg-white text-[#24565B]">
      <main>
        <section className="relative isolate flex min-h-[600px] flex-col overflow-hidden bg-[#24565B] sm:min-h-[680px] lg:min-h-[740px]">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url('${maritim_image}')` }}
            role="img"
            aria-label="Pemandangan ilustrasi pesisir Teluk Bakau"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#173F46]/95 via-[#24565B]/75 to-[#24565B]/25" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#173F46]/65 via-transparent to-[#173F46]/25" />

          <SiteHeader overHero />

          <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center px-5 pb-16 pt-12 sm:px-8 sm:pb-20 lg:px-12">
            <div className="max-w-[760px]">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#24565B]/30 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B8E1D8] backdrop-blur-sm sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A9D7CF]" />
                Desa Teluk Bakau · Kec. Gunung Kijang · Kab. Bintan
              </p>
              <h1 className="mt-6 max-w-[800px] text-[clamp(2.5rem,7.1vw,5.8rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-white">
                Potensi desa pesisir, <span className="text-[#A9D7CF]">terpetakan dalam satu peta</span>
              </h1>
              <p className="mt-5 max-w-[580px] text-[14px] leading-[1.85] text-white/80 sm:mt-6 sm:text-[16px]">
                Profil spasial Desa Teluk Bakau menghimpun lahan, perairan, fasilitas, wisata, dan usaha masyarakat dalam geodatabase, sebagai dasar perencanaan pembangunan desa yang berbasis data.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="/peta" target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#A9D7CF] px-5 text-[12px] font-bold text-[#24565B] transition-colors hover:bg-[#BDE5DC]">
                  Buka peta interaktif
                  <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
              {error && <p role="status" className="mt-4 text-xs text-[#ffe0b7]">{error}</p>}
            </div>
          </div>
        </section>

        <section className="bg-[#24565B] text-white">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-y divide-white/15 px-5 sm:px-8 md:grid-cols-4 md:divide-x md:divide-y-0 lg:px-12">
            {[
              { number: '±112,12 km²', description: 'luas wilayah desa, darat dan perairan' },
              { number: '8', description: 'unsur data dalam geodatabase' },
              { number: '5', description: 'kelas tutupan lahan terpetakan' },
              { number: '4', description: 'jenis alat tangkap perikanan tercatat' },
            ].map((stat) => (
              <div key={stat.description} className="px-4 py-6 sm:px-6 sm:py-7">
                <p className="text-[28px] font-semibold tracking-[-0.04em] sm:text-[36px]">{stat.number}</p>
                <p className="mt-1 max-w-[210px] text-[11px] leading-[1.6] text-[#B8E1D8] sm:text-[13px]">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="data" className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#397E78]">Potensi desa</p>
          <h2 className="mt-2 max-w-[760px] text-[30px] font-semibold leading-[1.12] tracking-[-0.05em] text-[#24565B] sm:text-[38px]">
            Empat kelompok potensi yang saling berhubungan
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Ruang dan lahan',
                color: '#78965D',
                description: 'Perkebunan, semak belukar, hutan rimba, lahan terbuka, dan ladang, dengan beragam komoditas seperti semangka, kelapa, sawit, pisang, dan durian, serta danau dan waduk.',
              },
              {
                title: 'Perairan dan perikanan',
                color: '#12A89A',
                description: 'Kelong apung, pancing, bubu, dan jaring dasar menghasilkan bilis, cumi-cumi, kerapu, kakap merah, dan beragam ikan karang.',
              },
              {
                title: 'Pelayanan dan wisata',
                color: '#E07B22',
                description: 'Masjid, sekolah, PAUD, Polindes, Posyandu, pelantar, serta Pantai Sadi dan Kampung Teripang yang mendukung wisata pesisir.',
              },
              {
                title: 'Ekonomi dan produk unggulan',
                color: '#B5651D',
                description: 'Kerajinan bambu dan kue bawang bilis kelor sudah berproduksi dan memiliki pasar, dengan peluang perluasan pemasaran dan kemitraan.',
              },
            ].map((item) => (
              <article key={item.title} className="flex flex-col gap-3 rounded-xl border border-[#dce3de] bg-white p-5 sm:p-6">
                <span className="h-1.5 w-10 rounded-full" style={{ backgroundColor: item.color }} />
                <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-[#24565B] sm:text-[22px]">{item.title}</h3>
                <p className="text-[12px] leading-[1.7] text-[#536f72] sm:text-[14px]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tentang" className="bg-[#F5F8F6]">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-12 lg:py-24">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#397E78]">Tentang program</p>
              <h2 className="mt-3 max-w-[520px] text-[30px] font-semibold leading-[1.1] tracking-[-0.05em] text-[#24565B] sm:text-[36px]">
                Penguatan perencanaan desa pesisir berbasis geospasial
              </h2>
              <p className="mt-5 max-w-[500px] text-[13px] leading-[1.9] text-[#536f72]">
                Data potensi desa selama ini tersebar di dokumen administratif dan belum tersaji sebagai peta. Program ini menyusun peta tematik dan geodatabase bersama pemerintah desa, lalu melatih aparatur desa agar mampu memperbaruinya secara mandiri.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['SDG 11 · Kota dan Permukiman Berkelanjutan', 'SDG 14 · Ekosistem Laut', 'SDG 17 · Kemitraan'].map((sdg) => (
                  <span key={sdg} className="rounded-full border border-[#d5e2dc] bg-white px-3 py-2 text-[10px] font-medium text-[#476c68]">{sdg}</span>
                ))}
              </div>
            </div>
            <ol className="grid gap-3">
              {[
                { number: '1', title: 'Pengumpulan data', description: 'Survei lapangan, wawancara, dan titik koordinat GPS.' },
                { number: '2', title: 'Geodatabase dan peta tematik', description: 'Digitasi, pengisian atribut, dan verifikasi bersama desa.' },
                { number: '3', title: 'WebGIS dan profil spasial', description: 'Peta daring dan dokumen untuk perencanaan desa.' },
                { number: '4', title: 'Pelatihan aparatur desa', description: 'Literasi spasial dan cara memperbarui data.' },
              ].map((item) => (
                <li key={item.number} className="rounded-xl border border-[#dce3de] bg-white px-4 py-3.5 sm:px-5">
                  <h3 className="text-[12px] font-bold text-[#24565B]">{item.number}. {item.title}</h3>
                  <p className="mt-1 text-[11px] leading-[1.65] text-[#60797b]">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="peta" className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#397E78]">Peta interaktif</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.05em] text-[#24565B] sm:text-[38px]">
                Jelajahi wilayah Teluk Bakau
              </h2>
              <p className="mt-2 max-w-[620px] text-[12px] leading-[1.7] text-[#536f72] sm:text-[14px]">
                Pratinjau sebaran data spasial desa. Geser peta untuk menjelajahi wilayah.
              </p>
            </div>
            <p className="text-[10px] text-[#718783]">Batas desa bersifat sementara dan bukan referensi resmi.</p>
          </div>
          <div className="h-[280px] overflow-hidden rounded-xl border border-[#dce3de] shadow-[0_12px_36px_-24px_rgba(36,86,91,0.5)] sm:h-[340px]">
            <GeoMapPreview data={data} />
          </div>
        </section>
      </main>

      <footer className="bg-[#24565B] text-white">
        <div className="mx-auto grid max-w-[1320px] gap-7 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-9 lg:px-12">
          <div className="flex items-center gap-3">
            <LogoPlaceholder label="UMRAH" img={logo_umrah} />
            <LogoPlaceholder label="Mitra desa" img={logo_bintan} />
          </div>
          <div className="border-t border-white/20 pt-6 text-[11px] leading-[1.8] text-white/85 lg:border-l lg:border-t-0 lg:py-1 lg:pl-8">
            <p className="font-semibold text-white">
              Program Pengabdian kepada Masyarakat - Pemberdayaan Masyarakat Kepulauan, LPPM Universitas Maritim Raja Ali Haji, 2026.
            </p>
            <p className="mt-1 text-white/70">
              Mitra: Pemerintah Desa Teluk Bakau, Kabupaten Bintan.
            </p>
          </div>
          <p className="max-w-[260px] text-[10px] leading-[1.6] text-white/70">
            Batas desa pada peta bersifat sementara dan bukan referensi resmi.
          </p>
        </div>
      </footer>
    </div>
  )
}
