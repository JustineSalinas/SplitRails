import { useEffect, useRef, useState } from 'react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const POPUP_WIDTH = 240
const VIEWPORT_MARGIN = 16

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseISO(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildGrid(year: number, month: number) {
  const startOffset = new Date(year, month, 1).getDay()
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(year, month, i - startOffset + 1))
  }
  return cells
}

export function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const selected = parseISO(value)
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [align, setAlign] = useState<'left' | 'right'>('left')
  const [viewDate, setViewDate] = useState(selected ?? today)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function openPicker() {
    setViewDate(selected ?? today)
    setOpen((wasOpen) => {
      const next = !wasOpen
      if (next && rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect()
        const overflowsRight = rect.left + POPUP_WIDTH > window.innerWidth - VIEWPORT_MARGIN
        setAlign(overflowsRight ? 'right' : 'left')
      }
      return next
    })
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const cells = buildGrid(year, month)
  const label = selected
    ? selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select date'

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-2.5 px-3 border-[0.5px] border-border rounded-lg text-sm font-sans bg-white text-text-primary cursor-pointer hover:bg-bg focus:outline-none focus:border-info focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]"
      >
        <span>{label}</span>
        <span className="msym text-base text-text-muted">calendar_today</span>
      </button>

      {open && (
        <div
          style={{ width: POPUP_WIDTH }}
          className={`absolute z-20 mt-1.5 p-2.5 bg-white/95 backdrop-blur-xl rounded-xl border-[0.5px] border-border/60 shadow-[0_12px_28px_rgba(11,28,48,0.14),0_2px_8px_rgba(11,28,48,0.06)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1 rounded-full text-text-secondary cursor-pointer hover:bg-info-light hover:text-text-primary"
            >
              <span className="msym text-base">chevron_left</span>
            </button>
            <span className="text-xs font-semibold text-text-primary">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1 rounded-full text-text-secondary cursor-pointer hover:bg-info-light hover:text-text-primary"
            >
              <span className="msym text-base">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7">
            {WEEKDAYS.map((wd, i) => (
              <div key={i} className="text-center text-[9px] font-semibold text-text-muted uppercase py-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((date, i) => {
              const inMonth = date.getMonth() === month
              const isSelected = selected ? isSameDay(date, selected) : false
              const isToday = isSameDay(date, today)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toISO(date))
                    setOpen(false)
                  }}
                  className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-[12px] cursor-pointer ${
                    isSelected
                      ? 'bg-info text-white font-semibold'
                      : inMonth
                        ? `text-text-primary hover:bg-info-light ${isToday ? 'font-bold text-info' : ''}`
                        : 'text-border'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
