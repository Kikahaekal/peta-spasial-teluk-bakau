import type { ReactNode } from 'react'

export type IconName =
  | 'arrow'
  | 'building'
  | 'close'
  | 'compass'
  | 'chevron'
  | 'facility'
  | 'fish'
  | 'layers'
  | 'map'
  | 'minus'
  | 'pin'
  | 'plus'
  | 'road'
  | 'search'
  | 'target'
  | 'tourism'
  | 'water'

const ICONS: Record<IconName, ReactNode> = {
  arrow: <path d="M7 17 17 7M7 7h10v10" />,
  building: (
    <>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M8 9v.01M8 12v.01M8 15v.01M8 18v.01M15 12v.01M15 15v.01M15 18v.01" />
    </>
  ),
  close: <path d="m18 6-12 12M6 6l12 12" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.2 7.8-2.4 6-6 2.4 2.4-6 6-2.4Z" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  facility: (
    <>
      <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
      <path d="M9 10h.01M15 10h.01" />
    </>
  ),
  fish: (
    <>
      <path d="M2 12s3.5-6 10-6c3.5 0 6 2 8 6-2 4-4.5 6-8 6-6.5 0-10-6-10-6Z" />
      <path d="m2 12-1-4 4 2M2 12l-1 4 4-2M14 10h.01" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  road: (
    <>
      <path d="M8 3 5 21M16 3l3 18M12 5v3M12 11v3M12 17v2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  tourism: (
    <>
      <path d="M3 21h18M5 21l2-9 5-3 5 3 2 9M9 21v-5h6v5" />
      <path d="M12 9V3m-3 3 3-3 3 3" />
    </>
  ),
  water: (
    <>
      <path d="M12 3s7 7.2 7 12a7 7 0 1 1-14 0c0-4.8 7-12 7-12Z" />
      <path d="M9 16a3 3 0 0 0 3 3" />
    </>
  ),
}

export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  )
}
