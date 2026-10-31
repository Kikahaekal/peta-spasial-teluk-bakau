import { Icon } from './Icon'
import logo_umrah from '../../public/img/logo-umrah.png'

export function SiteHeader({ overHero = false }: { overHero?: boolean }) {
  const textColor = overHero ? 'text-white' : 'text-[#24565B]'

  return (
    <header className={`relative z-[1000] w-full ${overHero ? 'text-white' : 'bg-[#24565B] text-white'}`}>
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:min-h-[88px] sm:px-8 lg:px-12">
        <a href="/" aria-label="Profil Desa Teluk Bakau, beranda" className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${textColor}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[8px] font-bold uppercase tracking-[0.08em] sm:h-11 sm:w-11 sm:text-[9px] ${overHero ? 'border-white/70 text-white' : 'border-white/60  text-white'}`}>
            <img src={logo_umrah} alt="Logo Umrah" />
          </span>
          <span className="hidden min-w-0 flex-col text-[10px] font-semibold uppercase leading-[1.5] tracking-[0.08em] sm:flex lg:text-[11px]">
            <span>Profil Desa Teluk Bakau</span>
            <span className={overHero ? 'text-white/65' : 'text-white/65'}>Berbasis Geospasial</span>
          </span>
          <span className="min-w-0 text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.05em] sm:hidden">Teluk Bakau<br />Geospasial</span>
        </a>

        <nav aria-label="Navigasi utama" className="flex shrink-0 items-center gap-3 text-[10px] font-medium sm:gap-5 sm:text-[12px] lg:gap-8">
          <a href="/" aria-current="page" className={`transition-colors ${textColor}`}>
            Beranda
          </a>
          <a
            href="/peta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buka peta interaktif"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#A9D7CF] px-3 text-[10px] font-semibold text-[#24565B] transition-colors hover:bg-[#BDE5DC] sm:min-h-10 sm:gap-2 sm:px-4 sm:text-[11px]"
          >
            <span className="hidden sm:inline">Peta interaktif</span>
            <span className="sm:hidden">Peta</span>
            <Icon name="arrow" size={14} />
          </a>
        </nav>
      </div>
    </header>
  )
}
