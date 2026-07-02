import { FormEvent, useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart3, Check, CheckCircle2, ChevronRight, FileText, Fingerprint, LockKeyhole, Menu, Radar, ScanSearch, ShieldCheck, Sparkles, X } from 'lucide-react'
import { scanMint, type ScanResult } from './scanner'

const EXAMPLE = 'AkGtTz4FgowEznDoxnnRpaVfAuBBKJbdEh8xkDgHA6nQ'
const allocations = [
  ['Topluluk katkıları', 50, '#53e5a2'], ['Ürün hazinesi', 20, '#3db7e4'],
  ['Kurucu - 12 ay kilit', 15, '#8b7cf6'], ['Gelecekteki likidite', 10, '#f4bf5e'], ['Ortaklıklar', 5, '#ef7f98'],
] as const

function short(value: string | null) { return value ? `${value.slice(0, 5)}…${value.slice(-5)}` : 'Kalıcı olarak kapalı' }
function formatSupply(value: number) { return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value) }

export function App() {
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [menu, setMenu] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); setResult(null)
    try { setResult(await scanMint(address.trim())) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Analiz tamamlanamadı.') }
    finally { setLoading(false) }
  }

  return <main>
    <div className="notice"><span>●</span> TokenLucid beta geliştirmesi sürüyor. TLCD henüz satışta değildir.</div>
    <nav>
      <a className="brand" href="#top"><img src="/tokenlucid-token.svg" alt=""/>TokenLucid</a>
      <div className={`nav-links ${menu ? 'open' : ''}`}>
        <a href="#urun" onClick={() => setMenu(false)}>Ürün</a><a href="#metodoloji" onClick={() => setMenu(false)}>Metodoloji</a><a href="#token" onClick={() => setMenu(false)}>TLCD</a><a href="#yol" onClick={() => setMenu(false)}>Yol haritası</a>
        <a href="/en.html">English</a><a className="paper-link" href="/whitepaper.pdf" target="_blank"><FileText size={15}/> White paper</a>
      </div>
      <button className="menu" aria-label="Menüyü aç" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </nav>

    <section id="top" className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14}/> Zincir üstü veri, açık kurallar</div>
          <h1>Token almadan önce<br/><em>riskini gör.</em></h1>
          <p>Solana tokenlerinin kritik yetkilerini ve cüzdan yoğunlaşmasını doğrudan zincir üstü veriden inceleyen bağımsız risk katmanı.</p>
          <div className="hero-actions"><a className="primary" href="#scanner">Ücretsiz analiz <ArrowRight size={17}/></a><a className="secondary" href="/whitepaper.pdf" target="_blank">White paper</a></div>
          <div className="trust-row"><span><Check/> Kayıt gerektirmez</span><span><Check/> Cüzdan bağlamaz</span><span><Check/> Açık metodoloji</span></div>
        </div>
        <div className="radar-card">
          <div className="radar-top"><span>CANLI RİSK SİNYALLERİ</span><Radar size={18}/></div>
          <div className="radar-visual"><i/><i/><i/><b/><span>TL</span></div>
          <div className="signal"><span>Mint yetkisi</span><strong>+25 puan</strong></div>
          <div className="signal"><span>Freeze yetkisi</span><strong>+20 puan</strong></div>
          <div className="signal"><span>Cüzdan yoğunlaşması</span><strong>+50 puana kadar</strong></div>
        </div>
      </div>
    </section>

    <section id="scanner" className="scanner-wrap">
      <div className="section-kicker">TOKENLUCID SCANNER</div>
      <h2>Bir mint adresi, dört kritik kontrol.</h2>
      <form onSubmit={submit}>
        <div className="search"><ScanSearch/><input aria-label="Token adresi" value={address} onChange={e => setAddress(e.target.value)} placeholder="Solana token mint adresini yapıştır…"/><button disabled={loading}>{loading ? <><span className="spinner"/>Taranıyor</> : <>Analiz et <ArrowRight size={17}/></>}</button></div>
        <button className="example" type="button" onClick={() => setAddress(EXAMPLE)}>Örnek: TLCD devnet mint adresini kullan</button>
      </form>
      {error && <div className="error"><AlertTriangle size={18}/>{error}</div>}

      {result && <div className="result" aria-live="polite">
        <div className="result-head">
          <div><span>{result.concentrationAvailable ? 'OTOMATİK RİSK PUANI' : 'KISMİ RİSK PUANI'}</span><h3 className={result.level.toLowerCase()}>{result.score}<small>/100</small></h3></div>
          <div className={`pill ${result.level.toLowerCase()}`}>{result.level} risk</div>
        </div>
        <div className="metrics">
          <article><small>Token standardı</small><strong>{result.program}</strong></article>
          <article><small>Toplam arz</small><strong>{formatSupply(result.supply)}</strong></article>
          <article><small>Mint yetkisi</small><strong>{short(result.mintAuthority)}</strong></article>
          <article><small>Freeze yetkisi</small><strong>{short(result.freezeAuthority)}</strong></article>
          <article><small>En büyük hesap</small><strong>{result.concentrationAvailable ? `%${result.top1.toFixed(1)}` : 'Veri kısıtlı'}</strong></article>
          <article><small>İlk 10 hesap</small><strong>{result.concentrationAvailable ? `%${result.top10.toFixed(1)}` : 'Veri kısıtlı'}</strong></article>
        </div>
        <div className="warnings"><h4>Analiz notları</h4>{result.warnings.length ? result.warnings.map(note => <p key={note}><AlertTriangle size={17}/>{note}</p>) : <p className="safe"><CheckCircle2 size={17}/>Temel kontrollerde belirgin bir risk işareti bulunmadı.</p>}<small>Otomatik sonuç yatırım tavsiyesi veya kapsamlı güvenlik denetimi değildir.</small></div>
        <a className="explorer" href={`https://explorer.solana.com/address/${result.address}?cluster=devnet`} target="_blank" rel="noreferrer">Solana Explorer'da devnet üzerinde doğrula <ArrowRight size={15}/></a>
      </div>}
    </section>

    <section id="urun" className="feature-section">
      <div className="section-heading"><div><div className="section-kicker">NEDEN TOKENLUCID?</div><h2>Gürültünün içinde<br/>doğrulanabilir sinyaller.</h2></div><p>Tek bir “güvenli/güvensiz” etiketi vermiyoruz. Kullanıcının kendi kararını verebilmesi için zincir üstü gerçekleri, ağırlıkları ve sınırlamaları gösteriyoruz.</p></div>
      <div className="features">
        <article><div className="icon"><ShieldCheck/></div><span>01</span><h3>Yetki kontrolü</h3><p>Yeni token basma ve hesap dondurma yetkilerinin hâlâ açık olup olmadığını ortaya çıkarır.</p></article>
        <article><div className="icon"><BarChart3/></div><span>02</span><h3>Dağılım analizi</h3><p>En büyük hesapların toplam arza oranını ölçerek yoğunlaşma ve satış baskısı riskini görünür kılar.</p></article>
        <article><div className="icon"><Fingerprint/></div><span>03</span><h3>Doğrulanabilir sonuç</h3><p>Sonuçlar Solana RPC verisine dayanır; mint adresiyle bağımsız blok gezginlerinde kontrol edilebilir.</p></article>
      </div>
    </section>

    <section id="metodoloji" className="method-section">
      <div className="method-card"><div className="section-kicker">PUANLAMA METODOLOJİSİ</div><h2>Her puanın görünür bir nedeni var.</h2><p>Puan, temel akıllı sözleşme ve dağılım risklerinin toplamıdır. Likidite kilidi, sosyal itibar ve harici sözleşme çağrıları beta sonrasında ayrı modüller olarak eklenecektir.</p><a href="/whitepaper.pdf" target="_blank">Tam metodolojiyi oku <ChevronRight size={16}/></a></div>
      <div className="score-table">
        <div><span>Mint yetkisi açık</span><b>+25</b></div><div><span>Freeze yetkisi açık</span><b>+20</b></div><div><span>En büyük hesap ≥ %40</span><b>+30</b></div><div><span>İlk 5 hesap ≥ %70</span><b>+20</b></div><div><span>Sıfır arz / anomali</span><b>+5</b></div>
        <small>0–29 düşük · 30–59 orta · 60–100 yüksek otomatik risk</small>
      </div>
    </section>

    <section id="token" className="token-section">
      <div className="token-copy"><div className="section-kicker">TLCD TOKEN</div><h2>Spekülasyon değil,<br/>ürün erişimi ve katkı.</h2><p>TLCD; ayrıntılı rapor kredileri, adres takip bildirimleri ve doğrulanmış topluluk katkılarının ödüllendirilmesi için tasarlanmıştır. Beta döneminde halka satılmaz.</p><div className="token-facts"><span><b>10M</b> Sabit arz</span><span><b>6</b> Ondalık</span><span><b>0</b> İşlem vergisi</span><span><b>0</b> Gizli yetki</span></div></div>
      <div className="allocation"><div className="donut"><div><b>10M</b><span>TLCD</span></div></div><div className="legend">{allocations.map(([name, value, color]) => <div key={name}><i style={{background: color}}/><span>{name}</span><b>%{value}</b></div>)}</div></div>
    </section>

    <section id="yol" className="roadmap-section"><div className="section-kicker">YOL HARİTASI</div><h2>Önce ürün. Sonra token.</h2><div className="roadmap">
      <article className="active"><span>ŞİMDİ</span><h3>01 · Temel analiz</h3><p>Mint/freeze yetkileri, arz ve cüzdan yoğunlaşması, açık puanlama.</p></article>
      <article><span>BETA</span><h3>02 · Derin raporlar</h3><p>Likidite, holder değişimleri, alarm sistemi ve topluluk doğrulaması.</p></article>
      <article><span>GENESIS</span><h3>03 · TLCD dağıtımı</h3><p>Hukuki hazırlık, sabit arz, yetki iptali ve katkı bazlı ilk dağıtım.</p></article>
      <article><span>BÜYÜME</span><h3>04 · API ve ortaklık</h3><p>Cüzdanlar, topluluklar ve araştırmacılar için ücretli risk API'si.</p></article>
    </div></section>

    <section className="cta"><div><div className="section-kicker">ŞEFFAFLIK VARSA GÜVEN BAŞLAR</div><h2>Bir tokeni incelemek<br/>30 saniyeden kısa sürer.</h2></div><a className="primary" href="#scanner">Mint adresini analiz et <ArrowRight/></a></section>
    <footer><div><a className="brand" href="#top"><img src="/tokenlucid-token.svg" alt=""/>TokenLucid</a><p>Zincir üstü riskleri anlaşılır kılan açık analiz katmanı.</p></div><div className="footer-links"><a href="/en.html">English</a><a href="#metodoloji">Metodoloji</a><a href="/whitepaper.pdf" target="_blank">White paper</a><a href="/privacy.html">Gizlilik</a><a href="/terms.html">Koşullar</a></div><p className="legal">© 2026 TokenLucid. Yatırım tavsiyesi değildir. TLCD henüz halka arz edilmemiştir.</p></footer>
  </main>
}
