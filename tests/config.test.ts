import { describe, expect, it } from 'vitest'
import { allocationBaseUnits, isImmutableAssetUri, loadConfig, validateConfig } from '../scripts/lib.js'

describe('TLCD token yapılandırması', () => {
  const config = loadConfig()

  it('sabit arz ve sembolü korur', () => {
    expect(config.symbol).toBe('TLCD')
    expect(config.supply).toBe(10_000_000)
    expect(config.decimals).toBe(6)
  })

  it('dağıtımı yüzde 100 yapar', () => {
    expect(config.allocations.reduce((sum, item) => sum + item.percent, 0)).toBe(100)
    expect(validateConfig(config)).toEqual([])
  })

  it('dağıtımı kayan nokta kullanmadan baz birimlere böler', () => {
    const { total, amounts } = allocationBaseUnits(config)
    expect(amounts.reduce((sum, value) => sum + value, 0n)).toBe(total)
    expect(amounts[0]).toBe(5_000_000_000_000n)
  })

  it('yalnız içerik adresli metadata URI biçimlerini kabul eder', () => {
    expect(isImmutableAssetUri(`https://arweave.net/${'a'.repeat(43)}`)).toBe(true)
    expect(isImmutableAssetUri('https://example.com/token.json')).toBe(false)
  })

  it('eksik ana ağ alanlarını reddeder', () => {
    expect(validateConfig(config, true).length).toBeGreaterThan(0)
  })
})
