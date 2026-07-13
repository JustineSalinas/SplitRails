import { useId, type ReactNode } from 'react'

type ChipVariant = 'action' | 'waiting' | 'done'

const chipClasses: Record<ChipVariant, string> = {
  action: 'bg-action-light text-action-hover',
  waiting: 'bg-neutral-light text-text-secondary',
  done: 'bg-success-light text-success',
}

const chipDotClasses: Record<ChipVariant, string> = {
  action: 'bg-action',
  waiting: 'bg-neutral',
  done: 'bg-success',
}

interface RingProps {
  trackColor: string
  /** Arc length out of a 113.1 circumference (r=18). 0 for an empty/dashed track. */
  arc: number
  strokeColor: string | 'gradient'
  dashedTrack?: boolean
}

interface IconProps {
  name: string
  filled?: boolean
  color?: string
  gradient?: boolean
}

interface SplitCardProps {
  ring: RingProps
  icon: IconProps
  chip: { label: string; variant: ChipVariant }
  title: string
  subtitle: string
  footer: ReactNode
}

function Ring({ ring, icon }: { ring: RingProps; icon: IconProps }) {
  const gradientId = useId()
  const isGradient = ring.strokeColor === 'gradient'

  return (
    <div className="relative inline-flex w-11 h-11 items-center justify-center">
      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke={ring.trackColor}
          strokeWidth="4"
          strokeDasharray={ring.dashedTrack ? '2 3' : undefined}
        />
        {ring.arc > 0 && (
          <>
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={isGradient ? `url(#${gradientId})` : ring.strokeColor}
              strokeWidth="4"
              strokeDasharray={`${ring.arc} 113.1`}
              strokeLinecap="round"
              className="transition-[stroke] duration-300"
            />
            {isGradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#007AFF" />
                  <stop offset="100%" stopColor="#00C7BE" />
                </linearGradient>
              </defs>
            )}
          </>
        )}
      </svg>
      <span
        className={`msym absolute text-[18px] ${icon.filled ? 'fill' : ''} ${icon.gradient ? 'accent-grad-text' : ''}`}
        style={icon.gradient ? undefined : { color: icon.color }}
      >
        {icon.name}
      </span>
    </div>
  )
}

export function SplitCard({ ring, icon, chip, title, subtitle, footer }: SplitCardProps) {
  return (
    <div className="bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <Ring ring={ring} icon={icon} />
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${chipClasses[chip.variant]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${chipDotClasses[chip.variant]}`} />
          {chip.label}
        </span>
      </div>
      <div>
        <h3 className="text-[17px] font-semibold m-0 mb-1 tracking-tight text-text-primary">{title}</h3>
        <p className="text-[13px] text-text-secondary m-0">{subtitle}</p>
      </div>
      <hr className="h-[0.5px] bg-border/50 border-none m-0" />
      {footer}
    </div>
  )
}
