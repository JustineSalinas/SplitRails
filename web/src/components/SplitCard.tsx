import type { ReactNode } from 'react'

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

interface SplitCardProps {
  chip: { label: string; variant: ChipVariant }
  title: string
  subtitle: string
  footer: ReactNode
}

export function SplitCard({ chip, title, subtitle, footer }: SplitCardProps) {
  return (
    <div className="group bg-white border-[0.5px] border-border/50 rounded-[14px] shadow-card hover:-translate-y-0.5 hover:border-border hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.06)] transition-[transform,box-shadow,border-color] duration-200 cursor-pointer p-5 flex flex-col gap-4">
      <div className="flex justify-end">
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
