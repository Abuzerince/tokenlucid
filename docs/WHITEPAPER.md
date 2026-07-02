# TokenLucid / TLCD

## Zincir üstü riskleri anlaşılır kılan açık analiz katmanı

Sürüm 0.9 - Genesis öncesi proje açıklaması  
Tarih: 2 Temmuz 2026  
Durum: Beta / halka satış yok

> Önemli: Bu belge yatırım teklifi, izahname, hukuki görüş veya herhangi bir getiri vaadi değildir. TLCD henüz oluşturulmamış ve halka arz edilmemiştir. Offeror/issuer tüzel kişiliği ve kayıtlı adresi belirlenmeden, hukuk incelemesi tamamlanmadan ve gerekli düzenleyici bildirimler yapılmadan halka satış veya işlem platformuna kabul talep edilmeyecektir. Bu PDF, MiCA iXBRL bildiriminin yerine geçmez.

## 1. Yönetici özeti

Kripto kullanıcılarının önemli bir bölümü yeni tokenleri sosyal medya görünürlüğü, kısa vadeli fiyat hareketi veya doğrulanmamış topluluk iddiaları üzerinden değerlendirir. Oysa bir tokenin mint yetkisinin açık olması, hesapların dondurulabilmesi veya arzın az sayıda cüzdanda yoğunlaşması doğrudan zincir üstünde görülebilen temel risklerdir. Bu veriler blok gezginlerinde mevcut olsa da yeni kullanıcılar için parçalı, teknik ve yorumlanması güçtür.

TokenLucid, Solana token mint adresini alır; mint account ve en büyük token hesaplarını güvenilir RPC üzerinden okur; tanımlı, açık ve deterministik kurallarla risk göstergelerini üretir. Ürün, kesin bir “güvenli/güvensiz” hükmü vermek yerine göstergenin kaynağını, puan etkisini ve sınırlamasını kullanıcıya gösterir.

TLCD, ürünün gelir veya hisse senedi temsilcisi değildir. Ayrıntılı rapor kredileri, adres takip bildirimleri ve doğrulanmış topluluk katkılarının ödüllendirilmesi için tasarlanan sabit arzlı bir kullanım tokenidir. Beta aşamasında halka satılmaz. Ürünün ilk geliri abonelik, rapor ve API erişiminden hedeflenir; token fiyatından değil.

## 2. Problem

### 2.1 Bilgi asimetrisi

Token oluşturan taraf teknik ayarları bilir; alıcı çoğu zaman mint authority, freeze authority, metadata değiştirilebilirliği veya holder yoğunlaşmasını kontrol etmez. Bu asimetri kötü niyetli projelerde istismar edilir, iyi niyetli projelerde ise güven oluşturmayı zorlaştırır.

### 2.2 Veri var, açıklama yok

Solana verisi açıktır fakat ham RPC yanıtları ve blok gezginleri teknik bilgi gerektirir. Aynı veri farklı platformlarda bağlam verilmeden sunulduğunda kullanıcı yanlış güven hissine kapılabilir.

### 2.3 Tek puanın tehlikesi

Kapalı algoritmayla üretilen tek bir skor yanıltıcı olabilir. TokenLucid puanı tek başına nihai karar değildir; her puanın hangi sinyalden geldiği kullanıcıya gösterilir. Ürün sınırlamaları arayüzde ve bu belgede yayımlanır.

## 3. Çözüm ve ürün kapsamı

TokenLucid beta sürümü şu kontrolleri yapar:

1. Girilen adresin Solana mint account olup olmadığını doğrular.
2. Token Program veya Token-2022 programını belirler.
3. Toplam arz ve ondalık bilgisini okur.
4. Mint authority durumunu kontrol eder.
5. Freeze authority durumunu kontrol eder.
6. En büyük 1, 5 ve 10 token hesabının toplam arza oranını hesaplar.
7. Açık metodolojiye göre 0-100 arası otomatik risk puanı üretir.
8. Verinin Solscan gibi bağımsız bir gezginde doğrulanmasına bağlantı verir.

Beta sürümü likidite kilidini, harici program çağrılarını, sosyal itibar veya fiyat tahminini analiz etmez. Bu unsurlar ek modüller olmadan puana dahil edilmez.

## 4. Puanlama metodolojisi

| Sinyal | Koşul | Puan |
|---|---|---:|
| Mint authority | Açık | +25 |
| Freeze authority | Açık | +20 |
| En büyük hesap | Arzın en az %40'ı | +30 |
| En büyük hesap | Arzın %20-39,99'u | +18 |
| İlk 5 hesap | Arzın en az %70'i | +20 |
| İlk 5 hesap | Arzın %50-69,99'u | +10 |
| Arz anomalisi | Toplam arz sıfır | +5 |

Puan 100 ile sınırlandırılır. 0-29 düşük, 30-59 orta, 60-100 yüksek otomatik risk olarak etiketlenir. Holder hesapları borsa, AMM havuzu, vesting veya yakım hesabı olabilir; bu nedenle yoğunlaşma puanı tek başına kötü niyet kanıtı değildir. Gelecek sürümde bilinen program ve havuz adreslerinin etiketlenmesi planlanır.

## 5. Teknik mimari

Tarayıcı yalnızca mint adresini TokenLucid API'sine gönderir. API, girdi doğrulama ve hız sınırından sonra Solana RPC'ye sunucu tarafından bağlanır. RPC anahtarı istemciye gönderilmez. Ham sağlayıcı hataları kullanıcıya sızdırılmaz ve çağrılar zaman aşımıyla sınırlandırılır.

Uygulama cüzdan bağlamaz, imza istemez, fon hareket ettirmez ve özel anahtar toplamaz. Ürün ile token genesis araçları ayrı süreçlerdir. Token oluşturma scriptleri web API'sinden çağrılamaz.

## 6. TLCD kullanım modeli

TLCD için planlanan kullanım alanları:

- Ayrıntılı rapor kredilerinin ödenmesi.
- Belirli mint adresleri için yetki, holder veya likidite değişiklik alarmı.
- Doğrulanmış topluluk araştırması, etiketleme ve çeviri katkılarının ödüllendirilmesi.
- Metodoloji önerilerinde bağlayıcı olmayan topluluk sinyali.

TLCD; şirket hissesi, borçlanma aracı, temettü hakkı, gelir payı, faiz, geri alım garantisi veya sabit getiri sağlamaz. Yönetim sinyali yasal şirket yönetimi üzerinde hak doğurmaz.

## 7. Token parametreleri

| Parametre | Tasarım |
|---|---|
| Ağ | Solana Mainnet-Beta |
| Standart | SPL Token + Metaplex Token Metadata |
| İsim | TokenLucid Utility Token |
| Sembol | TLCD |
| Toplam arz | 10.000.000 |
| Ondalık | 6 |
| Arz modeli | Genesis sırasında tek sefer, sabit |
| Mint authority | Genesis sonrası kalıcı kaldırma |
| Freeze authority | Genesis sırasında kalıcı kaldırma |
| Metadata | Değiştirilemez |
| İşlem vergisi | Yok |
| Blacklist / satış engeli | Yok |

Özel transfer sözleşmesi yerine Solana'nın standart Token Programı kullanılır. Bu seçim saldırı yüzeyini azaltır ve cüzdan/DEX uyumluluğunu artırır.

## 8. Dağıtım ve hak ediş

| Havuz | Oran | TLCD | İlke |
|---|---:|---:|---|
| Topluluk katkıları | %55 | 5.500.000 | Belgeli görev ve doğrulanmış katkı |
| Ürün hazinesi | %20 | 2.000.000 | Ürün geliştirme ve operasyon |
| Kurucu payı | %10 | 1.000.000 | En az 12 ay kilit |
| Gelecekteki likidite | %10 | 1.000.000 | Ürün kullanımı ve uyum sonrası |
| Ortaklıklar | %5 | 500.000 | Belgeli entegrasyon ve araştırma |

Kurucu tokenleri doğrulanabilir vesting sözleşmesine aktarılmadan genesis tamamlanmış sayılmaz. Hazine çoklu imza cüzdanında tutulmalı; dağıtım cüzdanları, işlem imzaları ve kalan bakiyeler kamuya açıklanmalıdır.

## 9. Gelir modeli ve bütçe

İlk gelir modelinde ücretsiz temel analiz korunur. Gelir; ayrıntılı rapor paketleri, adres izleme aboneliği, topluluklar için çalışma alanı ve geliştiriciler için API kotasından hedeflenir. Başlangıç bütçesi alan adı, güvenilir RPC, barındırma ve hukuki ön incelemeye ayrılır.

TLCD satışı işletme sermayesi için zorunlu varsayılmaz. Ücretli ürün talebi doğrulanmadan likidite havuzu açılması planlanmaz. Bu yaklaşım kısa vadeli fiyat teşviki yerine sürdürülebilir ürün kullanımını ölçmeyi amaçlar.

## 10. Güvenlik

Web API'si hız sınırlama, küçük gövde limiti, güvenlik başlıkları, girdi doğrulama ve RPC zaman aşımı kullanır. Üretim RPC anahtarı sunucu ortam değişkeninde tutulur. Cüzdan anahtarları web sunucusunda bulunmaz.

Genesis aracı ana ağ için iki bağımsız kilit gerektirir: yapılandırmada `mainnetReady=true` ve açık onay işareti. Script toplam arzı bastıktan sonra freeze ve mint yetkilerini kalıcı kaldırır, ardından arz ve yetkileri zincirden tekrar okuyarak doğrular. Doğrulama başarısızsa başarı kaydı oluşturmaz.

Teknik güvenlik ekonomik veya hukuki güvenliğin yerine geçmez. Ana ağdan önce bağımsız kod incelemesi, çoklu imza ve vesting doğrulaması gerekir.

## 11. Hukuki ve düzenleyici yaklaşım

AB'de MiCA Title II kapsamında halka arz veya işlem platformuna kabul, kural olarak tüzel kişi, uygun white paper, yetkili otorite bildirimi, yayımlama ve pazarlama şartları doğurabilir. Bazı küçük teklif, ücretsiz dağıtım veya çalışan hizmete erişim sağlayan utility token istisnaları bulunmakla birlikte, borsada işleme kabul ve gönüllü white paper gibi durumlar kapsamı değiştirebilir.

Bu nedenle mevcut proje açıklaması düzenleyici onay veya bildirim değildir. Nihai offeror/issuer, kayıtlı adres, LEI/kimlik bilgileri, teklif koşulları ve ev sahibi üye devletler belli olmadığı için MiCA Annex I alanları tamamlanamaz. ESMA'nın 23 Aralık 2025'ten beri uygulanan iXBRL biçimi de PDF dışında ayrıca hazırlanmalıdır.

Pazarlama; fiyat artışı, garanti, risksiz getiri veya “erken alan kazanır” dili kullanmayacaktır. Gerekli white paper yayımlanmadan pazarlama ve halka satış başlatılmayacaktır.

## 12. Çevresel etki

TLCD, Solana'nın Proof-of-Stake tabanlı mevcut konsensüsünü kullanır ve kendi doğrulayıcı/madencilik ağına sahip değildir. Solana Foundation'ın Eylül 2024 raporu, ağın 2024 enerji tüketimini 8.755 MWh ve işlem başına ortalama tüketimi 0,00412 Wh olarak tahmin etmiştir. Bu değerler TLCD'e özel ölçüm değildir ve zamanla değişebilir.

Nihai MiCA açıklaması, Commission Delegated Regulation (EU) 2025/422 kapsamındaki güncel gösterge ve metodolojiyi kullanmalıdır. TokenLucid, nihai bildirim öncesinde güncel Solana Climate Dashboard ve bağımsız metodoloji verisini yeniden değerlendirecektir.

## 13. Yol haritası

### Aşama 1 - Temel ürün

Mint/freeze yetkileri, arz, holder yoğunlaşması, açık puan ve bağımsız doğrulama bağlantıları.

### Aşama 2 - Beta doğrulama

Likidite analizi, değişiklik alarmı, etiketli adresler, kullanıcı geri bildirimi ve ilk ücretli rapor denemeleri.

### Aşama 3 - Uyum ve genesis

Tüzel kişi, hukuk incelemesi, gerekiyorsa iXBRL bildirim, bağımsız güvenlik incelemesi, çoklu imza, vesting ve sabit arzlı TLCD genesis.

### Aşama 4 - Büyüme

Risk API'si, araştırmacı görevleri, cüzdan/analiz ortaklıkları ve ölçülebilir ürün geliri. DEX likiditesi yalnızca kullanım, uyum ve yeterli sermaye sonrasında değerlendirilir.

## 14. Temel riskler

- Otomatik skor yanlış pozitif veya yanlış negatif üretebilir.
- RPC kesintisi veya gecikmesi analiz hizmetini bozabilir.
- Holder yoğunlaşması AMM, borsa veya vesting adreslerini yanlış yorumlayabilir.
- Token kullanımı için yeterli talep oluşmayabilir.
- Düzenleyici sınıflandırma ülke, dağıtım ve pazarlama biçimine göre değişebilir.
- SOL ve TLCD fiyatı yüksek oynaklık gösterebilir; likidite oluşmayabilir.
- Cüzdan, çoklu imza veya operasyon anahtarlarının kaybı fon kaybına yol açabilir.
- Üçüncü taraf Solana, Metaplex, RPC, hosting veya blok gezgini hizmetleri değişebilir.

## 15. Kaynaklar

1. Regulation (EU) 2023/1114 (MiCA): https://eur-lex.europa.eu/eli/reg/2023/1114
2. ESMA MiCA ve iXBRL: https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica
3. Commission Delegated Regulation (EU) 2025/422: https://eur-lex.europa.eu/eli/reg_del/2025/422/oj
4. Solana create mint: https://solana.com/docs/tokens/basics/create-mint
5. Solana set authority: https://solana.com/docs/tokens/basics/set-authority
6. Metaplex create fungible token: https://developers.metaplex.com/tokens/create-a-token
7. Solana Climate methodology: https://climate.solana.com/methodology
8. Solana Energy Impact Report, September 2024: https://solana.com/news/energy-impact-report-2024

## 16. İletişim ve eksik kurumsal alanlar

Proje çalışma adı: TokenLucid  
E-posta: hello@tokenlucid.io (alan adı alındıktan sonra etkinleştirilecek)  
Web: Nihai alan adı bekleniyor  
Offeror/issuer tüzel kişiliği: Henüz kurulmadı  
Kayıtlı adres ve LEI: Henüz belirlenmedi  
Token mint adresi: Genesis sonrası yayımlanacak

### Genesis öncesi zorunlu kapılar

- Tüzel kişi ve nihai faydalanıcı bilgileri tamamlanır.
- Yerel hukuk danışmanı token sınıflandırmasını yazılı olarak değerlendirir.
- Gerekiyorsa yetkili otorite bildirimi ve iXBRL white paper tamamlanır.
- Alan adı, metadata ve resmi iletişim kanalları etkinleştirilir.
- Hazine çoklu imza, kurucu payı vesting ve dağıtım cüzdanları doğrulanır.
- Bağımsız güvenlik incelemesi ve ana ağ prova raporu yayımlanır.

### Kapanış

TokenLucid'in başarı ölçütü TLCD fiyatı değil; doğru analiz sayısı, geri dönen kullanıcı, ücretli rapor talebi, yanlış pozitif/negatif oranı ve şeffaf katkı üretimidir. Genesis kararı ancak bu göstergeler ve hukuki hazırlık birlikte yeterli olduğunda alınacaktır.
