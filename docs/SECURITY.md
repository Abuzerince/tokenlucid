# Güvenlik modeli

## Web ve API

- RPC erişimi sunucu tarafında tutulur; sağlayıcı anahtarı istemci paketine girmez.
- API gövdesi 8 KB ile sınırlıdır.
- IP başına dakikada 30 API isteği sınırı uygulanır.
- Mint adresi uzunluk ve base58 karakter kümesiyle doğrulanır; RPC ayrıca hesabın gerçekten mint olduğunu doğrular.
- RPC çağrıları 10 saniyede zaman aşımına uğrar ve ham sağlayıcı hataları kullanıcıya sızdırılmaz.
- `Helmet` güvenlik başlıkları uygulanır; `X-Powered-By` kapalıdır.
- Uygulama cüzdan bağlamaz, imza istemez ve özel anahtar toplamaz.

## Token genesis

- Standart Solana Token Programı ve Metaplex Token Metadata kullanılır; özel transfer vergisi veya yönetici sözleşmesi yoktur.
- Toplam arz tek seferde oluşturulur.
- Mint, tam arz, metadata ve iki authority iptali tek atomik Solana işlemindedir; kısmi genesis oluşamaz.
- Ana ağ arzı ücret cüzdanına değil ayrı `genesisCustody` saklama adresine gider.
- Freeze authority ve mint authority kalıcı olarak `None` yapılır.
- Metadata değiştirilemez (`isMutable: false`).
- Script, arzı ve yetki iptallerini zincirden tekrar okumadan başarı raporu üretmez.
- Mainnet için hem `mainnetReady=true` hem de açık `--confirm-mainnet=TLCD_FIXED_SUPPLY` işareti gerekir.
- RPC genesis hash kontrolü yanlış ağ kullanımını engeller; ana ağda özel HTTPS RPC zorunludur.
- Metadata ve görsel içerik adresli Arweave/IPFS üzerinde olmalı, SHA-256 değeri önceden sabitlenmelidir.
- Aynı ağ için ikinci mint oluşturulması deployment/pending kayıtlarıyla engellenir.
- Ana ağ dağıtımı JSON özel anahtarla otomatik yapılmaz; Phantom, donanım cüzdanı veya multisig imzası gerekir.
- Cüzdan dosyaları `.secrets/` altında tutulur ve Git tarafından dışlanır.

## Operasyon önerileri

1. Ana ağ dağıtımında donanım cüzdanı ve ayrı bir ücret cüzdanı kullanın.
2. Hazine ve ekip paylarını çoklu imza cüzdanında tutun.
3. Kurucu payı için bağımsız, doğrulanabilir vesting programı kullanın.
4. Alan adı, GitHub ve sosyal hesaplarda donanım anahtarlı MFA açın.
5. RPC, hosting ve alan adı sırlarını parola yöneticisinde saklayın.
6. Her dağıtım işleminin imzasını ve JSON kaydını kamuya açık kanıt sayfasında yayımlayın.

## Bağımlılık taraması

Üretim bağımlılıkları `npm audit --omit=dev` ile sıfır bilinen açık vermektedir. Solana/Metaplex araç zincirinde eski Web3.js transitif uyarıları bulunmaktadır; bu paketler üretim sunucusuna kurulmayacak geliştirme bağımlılıklarıdır. Mainnet öncesinde araç zinciri yeniden taranmalı ve mümkünse güncel Solana Kit tabanlı sürüme geçirilmelidir.
