import { Avatar } from './Avatar'

interface ParticipantRowProps {
  name: string
  subtitle: string
  avatarColor: string
  initials: string
  amount: number
  locked: boolean
  paid?: boolean
  removable?: boolean
  onNameChange: (name: string) => void
  onAmountChange: (amount: number) => void
  onToggleLock: () => void
  onDelete?: () => void
}

export function ParticipantRow({
  name,
  subtitle,
  avatarColor,
  initials,
  amount,
  locked,
  paid = false,
  removable = true,
  onNameChange,
  onAmountChange,
  onToggleLock,
  onDelete,
}: ParticipantRowProps) {
  return (
    <div className="flex items-center justify-between p-3.5 px-4 bg-white border-[0.5px] border-[#c6c5d4]/60 rounded-xl transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <Avatar initials={initials} bg={avatarColor} size={36} bordered={false} textColor="white" />
        <div>
          <div className="flex items-center gap-1.5">
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="border-none bg-transparent outline-none text-[15px] font-semibold text-[#0b1c30] p-0 w-[140px] font-sans focus:bg-[#EFF4FF] focus:rounded focus:px-1 focus:-mx-1"
            />
            {paid && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#1e6b3a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                Paid
              </span>
            )}
          </div>
          <div className="text-xs text-[#454652]">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title={locked ? 'Locked' : 'Lock share'}
          onClick={onToggleLock}
          className={`border-none cursor-pointer p-1.5 rounded-full ${
            locked ? 'text-[#FF9500] bg-[#FF9500]/15' : 'text-[#767683] bg-transparent hover:bg-[#EFF4FF] hover:text-[#0b1c30]'
          }`}
        >
          <span className="msym text-[18px]">{locked ? 'lock' : 'lock_open'}</span>
        </button>
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono text-sm text-[#767683]">$</span>
          <input
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
            className="w-[84px] text-right border-none bg-transparent text-xl font-semibold tracking-tight text-[#0b1c30] outline-none font-mono tabular-nums"
          />
        </div>
        {removable && onDelete && (
          <button
            type="button"
            title="Remove"
            onClick={onDelete}
            className="border-none bg-transparent cursor-pointer p-1.5 rounded-full text-[#767683] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]"
          >
            <span className="msym text-[18px]">close</span>
          </button>
        )}
      </div>
    </div>
  )
}
