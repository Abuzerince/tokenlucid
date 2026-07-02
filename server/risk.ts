export type RiskInput = {
  mintAuthority: string | null
  freezeAuthority: string | null
  supply: number
  top1: number
  top5: number
}

export function calculateRisk(input: RiskInput) {
  let score = 0
  const warnings: string[] = []
  if (input.mintAuthority) { score += 25; warnings.push('Mint yetkisi açık; toplam arz artırılabilir.') }
  if (input.freezeAuthority) { score += 20; warnings.push('Freeze yetkisi açık; token hesapları dondurulabilir.') }
  if (input.top1 >= 40) { score += 30; warnings.push(`En büyük hesap arzın %${input.top1.toFixed(1)} kadarını tutuyor.`) }
  else if (input.top1 >= 20) { score += 18; warnings.push(`En büyük hesapta yüksek yoğunlaşma var: %${input.top1.toFixed(1)}.`) }
  if (input.top5 >= 70) { score += 20; warnings.push(`İlk 5 hesap toplam arzın %${input.top5.toFixed(1)} kadarını tutuyor.`) }
  else if (input.top5 >= 50) score += 10
  if (input.supply === 0) { score += 5; warnings.push('Toplam arz sıfır görünüyor.') }
  score = Math.min(100, score)
  return { score, level: score >= 60 ? 'Yüksek' as const : score >= 30 ? 'Orta' as const : 'Düşük' as const, warnings }
}
