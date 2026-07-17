import { getEscrowClient } from './escrow'

async function run() {
  const contractId = 'CCXBJ3ZDLFHO4HZN3ODZTHFLLWAEYELN6V5QMUBNFUS3PBFYLBWSZQVI'
  console.log('Querying contract:', contractId)
  
  try {
    const client = getEscrowClient(undefined, contractId)
    
    const participantsVal = await client.get_participants()
    console.log('Participants on-chain:', participantsVal.result)
    
    const totals = await client.get_totals()
    console.log('Totals (cleared, required):', totals.result)
    
    const status = await client.status()
    console.log('Status:', status.result)
    
    // Check if the user's address is listed in the participants or has a share
    const myAddress = 'GADEOEKSVARYURMLWJ4NTATTD66AO733MA3DNI33RS7VFS7IFCBEMGWN'
    try {
      const share = await client.get_share({ participant: myAddress })
      console.log(`Share for ${myAddress}:`, share.result)
    } catch (e: any) {
      console.log(`Failed to get share for ${myAddress}:`, e.message)
    }
  } catch (err: any) {
    console.error('Error querying contract:', err.message)
  }
}

run()
