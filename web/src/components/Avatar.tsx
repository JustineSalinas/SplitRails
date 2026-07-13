interface AvatarProps {
  initials: string
  bg: string
  size?: number
  bordered?: boolean
  textColor?: string
  className?: string
}

export function Avatar({
  initials,
  bg,
  size = 26,
  bordered = true,
  textColor = 'var(--color-text-secondary)',
  className = '',
}: AvatarProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${bordered ? 'border-2 border-white' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: textColor,
        fontSize: size <= 28 ? 10 : 13,
      }}
    >
      {initials}
    </div>
  )
}
