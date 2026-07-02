# Mimari

```text
Tarayıcı
   |
   | POST /api/scan (yalnızca mint adresi)
   v
Express API --- hız limiti / Zod doğrulama / Helmet
   |
   | JSON-RPC (sunucu tarafı, anahtar gizli)
   v
Solana RPC
   |
   +-- mint account: supply, decimals, authorities
   +-- largest token accounts: holder concentration
```

Web uygulaması React + TypeScript + Vite, API Express üzerinde çalışır. Geliştirmede Express, Vite middleware'i yükler; üretimde derlenmiş `dist/` klasörünü sunar. RPC adresi yalnızca sunucu ortam değişkenindedir.

Token oluşturma kodu web sunucusundan tamamen ayrıdır. `scripts/` altındaki araçlar yalnızca operatörün açık komutuyla ve yerel keypair ile çalışır; hiçbir özel anahtar API veya tarayıcıya taşınmaz.

## Puanlama sınırı

Mevcut beta puanı mint/freeze yetkileri ve holder yoğunlaşmasını ölçer. Likidite kilidi, program çağrı analizi, sosyal sinyal veya fiyat tahmini yapmaz. Bu sınırlama kullanıcı arayüzünde ve white paper'da belirtilir.
