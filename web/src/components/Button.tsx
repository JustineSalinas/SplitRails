import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'nudge' | 'ghost'

export const buttonBaseClasses =
  'inline-flex items-center gap-1.5 rounded-full cursor-pointer tracking-wide transition-[transform,box-shadow,background] duration-150'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-br from-[#007AFF] to-[#00C7BE] text-white shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-97 px-[18px] py-2.5 text-[13px] font-semibold',
  nudge:
    'bg-[#FFECDE] text-[#7c2e00] hover:bg-[#FFDBCC] px-3 py-1.5 text-xs font-semibold',
  ghost:
    'bg-transparent text-[#414755] border-[0.5px] border-[#C1C6D7] hover:bg-[#F1F3FE] px-3 py-1.5 text-xs font-semibold',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${buttonBaseClasses} ${buttonVariantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
