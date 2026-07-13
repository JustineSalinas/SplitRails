import { useId } from 'react'

interface DonutSlice {
  id: string | number
  color: string
  amount: number
}

interface DonutChartProps {
  slices: DonutSlice[]
  total: number
  size?: number
  centerLabel?: string
  centerSubtitle?: string
  /** 'ring' is the thin SVG stroke style; 'pie' is the thick conic-gradient style used on PaySlice. */
  variant?: 'ring' | 'pie'
}

export function DonutChart({
  slices,
  total,
  size = 220,
  centerLabel = 'Total',
  centerSubtitle = `${slices.length} slices`,
  variant = 'ring',
}: DonutChartProps) {
  const gradientId = useId()
  let cumulative = 0

  if (variant === 'pie') {
    const holeSize = Math.round(size * 0.44)
    let deg = 0
    const stops = slices.map((slice) => {
      const pct = total > 0 ? (slice.amount / total) * 100 : 0
      const start = deg
      deg += (pct / 100) * 360
      const color = slice.color === 'gradient' ? 'var(--color-info)' : slice.color
      return `${color} ${start}deg ${deg}deg`
    })
    if (deg < 360) stops.push(`var(--color-neutral-light) ${deg}deg 360deg`)
    const conicGradient = `conic-gradient(from 0deg, ${stops.join(', ')})`

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="rounded-full shadow-[inset_0_0_0_0.5px_rgba(198,197,212,0.6)]"
          style={{ width: size, height: size, background: conicGradient }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center"
            style={{ width: holeSize, height: holeSize }}
          >
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">
              {centerLabel}
            </div>
            <div className="font-mono tabular-nums text-[22px] font-bold tracking-tight">
              ${total.toFixed(2)}
            </div>
            <div className="text-[10px] text-text-secondary mt-0.5">{centerSubtitle}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 42 42" className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} gradientTransform="rotate(135)">
            <stop offset="0%" stopColor="#007AFF" />
            <stop offset="100%" stopColor="#00C7BE" />
          </linearGradient>
        </defs>
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-neutral-light)" strokeWidth="6" />
        {slices.map((slice) => {
          const pct = total > 0 ? (slice.amount / total) * 100 : 0
          const dashoffset = -cumulative
          cumulative += pct
          return (
            <circle
              key={slice.id}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={slice.color === 'gradient' ? `url(#${gradientId})` : slice.color}
              strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={dashoffset}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-text-secondary">{centerLabel}</div>
        <div className="font-mono tabular-nums text-[28px] font-bold tracking-tight">
          ${total.toFixed(2)}
        </div>
        <div className="text-[11px] text-text-secondary mt-0.5">{centerSubtitle}</div>
      </div>
    </div>
  )
}
