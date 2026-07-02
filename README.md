# TokenLucid / TLCD

Canlı beta: https://tokenlucid.onrender.com

TokenLucid, Solana tokenleri için zincir üstü risk göstergelerini açıklanabilir bir puana dönüştüren açık metodolojili analiz ürünüdür. TLCD, gelecekte ayrıntılı rapor erişimi ve doğrulanmış katkı ödülleri için tasarlanan sabit arzlı kullanım tokenidir; henüz satışta değildir.

## Hazır bileşenler

- Profesyonel ve mobil uyumlu ürün sitesi
- Sunucu tarafında korunan RPC erişimi, hız sınırlama ve girdi doğrulama
- Mint/freeze yetkisi, arz ve holder yoğunlaşması analizi
- Deterministik risk puanlama testleri
- Solana + Metaplex fungible token oluşturma aracı
- Sabit arz sonrası mint/freeze yetkilerini kalıcı kaldırma
- Ana ağ için çift güvenlik kilidi ve dağıtım doğrulaması
- Token metadata, token görseli, white paper ve operasyon belgeleri

## Çalıştırma

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Tarayıcı: `http://127.0.0.1:5173`

## Doğrulama

```powershell
npm run check
npm audit --omit=dev
```

## Devnet token akışı

```powershell
npm run token:wallet
$env:SOLANA_KEYPAIR='.secrets/devnet-wallet.json'
npm run token:preflight
npm run token:create
npm run token:verify
```

Önce oluşturulan devnet cüzdanına faucet üzerinden test SOL gönderilmelidir. Ana ağ komutları ve zorunlu hazırlıklar [LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md) içindedir.

## Belgeler

- [White paper kaynağı](docs/WHITEPAPER.md)
- [Hukuk ve uyum araştırması](docs/LEGAL_AND_COMPLIANCE.md)
- [Güvenlik modeli](docs/SECURITY.md)
- [Mimari](docs/ARCHITECTURE.md)
- [Lansman kontrol listesi](docs/LAUNCH_CHECKLIST.md)
- [Tokenomics](docs/TOKENOMICS.md)
- [Dağıtım rehberi](docs/DEPLOYMENT.md)
- [Global platform uygunluk matrisi](docs/GLOBAL_LISTING_READINESS.md)
- [İngilizce white paper](output/pdf/tokenlucid-whitepaper-en.pdf)
- [Dolaşımdaki arz metodolojisi](docs/CIRCULATING_SUPPLY.md)
- [Devnet dağıtım ve kurucu kilit kanıtları](docs/DEVNET_DISTRIBUTION.md)

Global listeleme hazırlık kontrolü (eksik gerçek şirket/alan adı/piyasa bilgileri varken bilinçli olarak başarısız olur):

```powershell
npm run listing:check
```

Bu depo yatırım tavsiyesi, kamuya arz veya hukuki onay anlamına gelmez.
