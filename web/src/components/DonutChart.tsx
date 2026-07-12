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
}

export function DonutChart({
  slices,
  total,
  size = 220,
  centerLabel = 'Total',
  centerSubtitle = `${slices.length} slices`,
}: DonutChartProps) {
  const gradientId = useId()
  let cumulative = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 42 42" className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} gradientTransform="rotate(135)">
            <stop offset="0%" stopColor="#007AFF" />
            <stop offset="100%" stopColor="#00C7BE" />
          </linearGradient>
        </defs>
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E5EEFF" strokeWidth="6" />
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
        <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#454652]">{centerLabel}</div>
        <div className="font-mono tabular-nums text-[28px] font-bold tracking-tight">
          ${total.toFixed(2)}
        </div>
        <div className="text-[11px] text-[#454652] mt-0.5">{centerSubtitle}</div>
      </div>
    </div>
  )
}
