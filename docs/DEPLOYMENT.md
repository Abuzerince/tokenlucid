# Dağıtım rehberi

## Hazırlık

1. Alan adını ve kurumsal e-postayı edin.
2. Ücretli/dedike Solana RPC anahtarını `SOLANA_RPC_URLS` olarak gir; anahtarı istemci koduna koyma.
3. `HOST=0.0.0.0`, `PORT` ve ters proxy kullanılıyorsa `TRUST_PROXY=1` ayarla.
4. `npm ci && npm run check && npm audit --omit=dev` çalıştır.

## Docker

```powershell
docker build -t tokenlucid:0.1.0 .
docker run --rm -p 5173:5173 --env-file .env tokenlucid:0.1.0
```

Sağlık kontrolü: `GET /api/health`. Render Blueprint için kökteki `render.yaml` kullanılabilir. Ücretsiz plan yalnızca beta içindir; canlıda log, uptime alarmı, yedek RPC ve harcama limiti kurulmalıdır.

## Token yayını kapısı

Web dağıtımı token basımından bağımsızdır. Önce metadata alan adını güncelle, dağıtım cüzdanlarını gir, hukuk kontrolünü tamamla ve `npm run token:preflight -- --mainnet` çalıştır. Ana ağ komutu ayrıca `mainnetReady=true` ve açık onay işareti ister.
