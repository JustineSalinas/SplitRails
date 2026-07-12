import { useEffect, useRef, useState } from 'react'

interface SelectProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}

export function Select({ value, options, onChange, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
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

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-2.5 px-3 border-[0.5px] border-[#C6C5D4] rounded-lg text-sm font-sans bg-white text-[#0b1c30] cursor-pointer hover:bg-[#F8F9FF] focus:outline-none focus:border-[#007AFF] focus:shadow-[0_0_0_2px_rgba(0,122,255,0.1)]"
      >
        <span>{value}</span>
        <span
          className={`msym text-lg text-[#767683] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1.5 py-1 bg-white/95 backdrop-blur-xl rounded-[14px] border-[0.5px] border-[#c6c5d4]/60 shadow-[0_12px_28px_rgba(11,28,48,0.14),0_2px_8px_rgba(11,28,48,0.06)] overflow-hidden"
        >
          {options.map((option) => {
            const selected = option === value
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-left cursor-pointer ${
                  selected ? 'text-[#007AFF] font-semibold' : 'text-[#0b1c30] font-medium'
                } hover:bg-[#EFF4FF]`}
              >
                {option}
                {selected && <span className="msym text-base text-[#007AFF]">check</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
