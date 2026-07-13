import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'nudge' | 'ghost'

export const buttonBaseClasses =
  'inline-flex items-center gap-1.5 rounded-full cursor-pointer tracking-wide transition-[transform,box-shadow,background] duration-150'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-brand text-white shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)] active:scale-97 px-[18px] py-2.5 text-[13px] font-semibold',
  nudge:
    'bg-action-light text-action-hover hover:bg-[#FFDBCC] px-3 py-1.5 text-xs font-semibold',
  ghost:
    'bg-transparent text-text-secondary border-[0.5px] border-border hover:bg-neutral-light px-3 py-1.5 text-xs font-semibold',
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
