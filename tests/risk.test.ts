import { describe, expect, it } from 'vitest'
import { calculateRisk } from '../server/risk'

describe('risk scoring', () => {
  it('returns low risk for revoked authorities and distributed supply', () => {
    expect(calculateRisk({ mintAuthority: null, freezeAuthority: null, supply: 1_000_000, top1: 8, top5: 30 }).score).toBe(0)
  })
  it('caps severe risks at 100', () => {
    const result = calculateRisk({ mintAuthority: 'x', freezeAuthority: 'y', supply: 1, top1: 90, top5: 100 })
    expect(result.score).toBe(95)
    expect(result.level).toBe('Yüksek')
  })
  it('flags medium concentration', () => {
    expect(calculateRisk({ mintAuthority: null, freezeAuthority: null, supply: 100, top1: 25, top5: 60 }).score).toBe(28)
  })
})
