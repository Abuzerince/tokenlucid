import { calculateRisk } from './risk.js'

const TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

type RpcResponse<T> = { result?: T; error?: { message: string } }

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, {
      method: 'POST', signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, params }),
    })
    if (!response.ok) throw new Error(`RPC HTTP ${response.status}`)
    const data = await response.json() as RpcResponse<T>
    if (data.error) throw new Error(data.error.message)
    if (data.result === undefined) throw new Error('RPC boş yanıt verdi.')
    return data.result
  } finally { clearTimeout(timeout) }
}

export async function scanMint(address: string, rpcUrl: string) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) throw new Error('Geçerli bir Solana adresi girin.')
  const account = await rpc<any>(rpcUrl, 'getAccountInfo', [address, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  if (!account.value?.data?.parsed || account.value.data.parsed.type !== 'mint') throw new Error('Bu adres bir Solana token mint adresi değil.')
  const info = account.value.data.parsed.info
  let largest: any = { value: [] }
  let concentrationAvailable = true
  try { largest = await rpc<any>(rpcUrl, 'getTokenLargestAccounts', [address, { commitment: 'confirmed' }]) }
  catch { concentrationAvailable = false }
  const decimals = Number(info.decimals)
  const supply = Number(info.supply) / 10 ** decimals
  const balances = (largest.value ?? []).map((item: any) => Number(item.amount) / 10 ** decimals)
  const percent = (count: number) => supply > 0 ? Math.min(100, balances.slice(0, count).reduce((sum: number, value: number) => sum + value, 0) / supply * 100) : 0
  const top1 = percent(1), top5 = percent(5), top10 = percent(10)
  const risk = calculateRisk({ mintAuthority: info.mintAuthority, freezeAuthority: info.freezeAuthority, supply, top1, top5 })
  if (!concentrationAvailable) risk.warnings.push('Cüzdan yoğunlaşması RPC hız limiti nedeniyle bu taramada hesaplanamadı; puan yalnızca mevcut kontrollere dayanır.')
  return {
    address, supply, decimals, top1, top5, top10,
    concentrationAvailable,
    mintAuthority: info.mintAuthority ?? null,
    freezeAuthority: info.freezeAuthority ?? null,
    program: account.value.owner === TOKEN_2022 ? 'Token-2022' as const : 'SPL Token' as const,
    ...risk,
  }
}
