export interface DraftParticipant {
  id: number
  name: string
  initials: string
  avatarBg: string
  donutColor?: string
  address: string
  amount: number
  isPayer?: boolean
}

export interface EscrowDraft {
  label: string
  vendorAddress: string
  tokenAddress: string
  dueDate: string
  deadlineUnix: number
  total: number
  participants: DraftParticipant[]
}
