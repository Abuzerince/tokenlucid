# Lansman kontrol listesi

## Kod tarafında tamamlananlar

- [x] Üretim sitesi ve mobil tasarım
- [x] Sunucu tarafı RPC proxy ve hata sınırları
- [x] Hız limiti, güvenlik başlıkları ve girdi doğrulama
- [x] Otomatik risk puanı testleri
- [x] Sabit arzlı SPL token oluşturma aracı
- [x] Metaplex metadata ve değişmezlik
- [x] Mint/freeze authority iptali ve zincir üstü doğrulama
- [x] Ana ağ yanlış çalıştırma kilidi
- [x] White paper, tokenomics ve güvenlik belgeleri
- [x] Beta gizlilik politikası ve kullanım koşulları taslağı
- [x] Docker/Render dağıtım paketi ve sağlık kontrolü
- [x] İngilizce proje sayfası ve İngilizce white paper
- [x] CoinGecko/CMC/Jupiter/Phantom/Solscan/DEX uygunluk matrisi
- [x] 512 px ve 200 px PNG listeleme logoları
- [x] Atomik genesis, ayrı saklama adresi ve ikinci mint engeli

## Kullanıcı/şirket bilgisi gerektiren zorunlu maddeler

- [ ] Proje adı ve `TLCD` sembolü için marka/çakışma kontrolü
- [ ] Tüzel kişi, kayıtlı adres, yönetici ve iletişim bilgileri
- [ ] Yerel hukuk danışmanından MiCA sınıflandırma notu
- [ ] Yetkili ulusal otorite ve gerekiyorsa 20 iş günü bildirim takvimi
- [ ] ESMA şablonunda iXBRL white paper
- [ ] Gerçek alan adı; metadata içindeki `YOUR_DOMAIN` alanlarının değiştirilmesi
- [ ] Logo ve metadata JSON'unun Arweave/IPFS'ye yüklenmesi ve SHA-256 kaydı
- [ ] Ana ağ RPC sağlayıcısı ve gizli API anahtarı
- [ ] Hazine, topluluk, ekip, likidite ve ortaklık cüzdan adresleri
- [ ] Kurucu tokenleri için doğrulanabilir 12+ aylık vesting
- [ ] Çoklu imza hazine kurulumu
- [ ] Bağımsız güvenlik incelemesi
- [ ] İngilizce site ve belgelerde gerçek şirket/ekip/sosyal bilgileri
- [ ] DEX ilk fiyat, likidite kaynağı ve LP saklama/kilit politikasının yayımlanması
- [ ] Organik kullanıcı/holder/işlem geçmişi oluşmadan listeleme başvurusu yapılmaması
- [ ] Taslak politikaların hukuk kontrolü, şirket bilgileri ve şirket e-postası

## Ana ağ komutu

Yukarıdaki maddeler tamamlandıktan sonra `config/token.config.json` içinde gerçek metadata URI, dağıtım adresleri ve `mainnetReady: true` ayarlanır.

```powershell
$env:SOLANA_KEYPAIR='C:\guvenli\hardware-wallet-export.json'
$env:SOLANA_RPC_URL='https://YOUR_DEDICATED_RPC'
npm run token:preflight -- --mainnet --confirm-mainnet=TLCD_FIXED_SUPPLY --allow-one-time-key=TLCD_EPHEMERAL_PAYER
npm run token:create -- --mainnet --confirm-mainnet=TLCD_FIXED_SUPPLY --allow-one-time-key=TLCD_EPHEMERAL_PAYER
npm run token:verify -- --mainnet
```

Ana ağ arzı doğrudan `genesisCustody` adresine gönderilir. Dağıtım Phantom, donanım cüzdanı veya multisig üzerinden ayrı ayrı incelenip imzalanır; kurtarma kelimesi ya da Phantom özel anahtarı dışa aktarılmaz. Özel anahtar hiçbir zaman depoya eklenmez.
