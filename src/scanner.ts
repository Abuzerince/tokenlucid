export type ScanResult = {
  address: string
  score: number
  level: 'Düşük' | 'Orta' | 'Yüksek'
  supply: number
  decimals: number
  mintAuthority: string | null
  freezeAuthority: string | null
  top1: number
  top5: number
  top10: number
  concentrationAvailable: boolean
  program: 'SPL Token' | 'Token-2022'
  warnings: string[]
}

export async function scanMint(address: string): Promise<ScanResult> {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    throw new Error('Geçerli bir Solana token adresi girin.')
  }
  const response = await fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address }) })
  const data = await response.json() as ScanResult | { error: string }
  if (!response.ok || 'error' in data) throw new Error('error' in data ? data.error : 'Analiz tamamlanamadı.')
  return data
}
