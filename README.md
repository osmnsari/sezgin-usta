# Sezgin Usta – Randevu Defteri

Osman'dan Sezgin abiye. Telefonda çalışan, sesle randevu yazılabilen kişisel bir randevu defteri.
Kayıtlar sadece Sezgin abinin telefonunda durur; sunucu, hesap ya da ücret yoktur.

## GitHub Pages'te yayınlama (bir kez, ~5 dakika)

1. **github.com**'a gir, giriş yap.
2. Sağ üstteki **+** → **New repository**.
   - Repository name: `sezgin-usta`
   - **Public** seçili kalsın (ücretsiz yayın için gerekli; kodda kişisel bilgi yok).
   - **Create repository**.
3. Açılan sayfada **uploading an existing file** bağlantısına tıkla.
4. Bu klasördeki **tüm dosyaları** (index.html, app.js, nlu.js, style.css, sw.js, manifest.webmanifest, ikonlar) sürükleyip bırak → **Commit changes**.
5. Depoda **Settings** → soldan **Pages**.
   - Source: **Deploy from a branch**
   - Branch: **main**, klasör: **/(root)** → **Save**.
6. 1–2 dakika bekle, sayfayı yenile. Üstte adres çıkar:
   `https://KULLANICI-ADIN.github.io/sezgin-usta/`

## Önce kendi iPhone'unda dene

- Adresi Safari'de aç → Paylaş → **Ana Ekrana Ekle**.
- İkondan aç, mikrofona bas: "Yarın 3'te Ahmet saç sakal" de.
- Senin telefonundaki deneme kayıtları Sezgin abinin telefonuna **gitmez**; her telefonun defteri ayrıdır.

## Hediye anı

1. Linki Sezgin abiye WhatsApp'tan at.
2. Linki **Safari'de** açsın (WhatsApp içinde açılırsa sağ üstten "Safari'de aç").
3. Karşılama ekranı çıkar → **Başlayalım**.
4. Paylaş → **Ana Ekrana Ekle** → **Ekle**.
5. Ana ekrandaki **Sezgin Usta** ikonundan açsın. Mikrofona ilk basışta **İzin Ver** desin.

## Neler yapabiliyor

- **Sesle:** "Yarın 3'te Ahmet saç sakal", "Cuma 10 buçukta Mehmet saç", "Ahmet'i 5'e al",
  "Kaan'ın randevusunu iptal et", "Ahmet'e not al: kenarlar 2 numara", "Yarın kimler var?",
  "Bugün boş saatim var mı?", "Emre gelmedi", "Ahmet en son ne zaman geldi?"
- Mikrofon izin vermezse klavyedeki 🎤 tuşuyla aynı cümle yazdırılabilir.
- Günlük liste, boş aralıklar (dokununca randevu yazılır), hafta şeridi.
- Müşteri kartı: "nasıl kestirir" notu, son geliş, genelde kaç haftada bir geldiği, geçmiş.
- "Epeydir gelmeyenler" listesi.
- Tek dokunuşla WhatsApp hatırlatma ve randevu bildirimi (mesaj hazır açılır, gönder'e basılır).
- Her işlemde **Geri al**.
- Haftalık **yedek** hatırlatması; yedek WhatsApp'a ya da iCloud'a gönderilir, geri yüklenebilir.
- İnternet olmadan da açılır.

## Güncelleme yaparsan

Değişen dosyaları GitHub'da tekrar yükle (Add file → Upload files → Commit).
`sw.js` içindeki `SURUM` değerini **mutlaka** bir artır (ör. `sezgin-usta-v3` → `sezgin-usta-v4`); yoksa telefonlar yeni sürümü almaz.
Yeni sürüm ancak bütün dosyalar sorunsuz inerse devreye girer; bir dosya eksikse eski sürüm çalışmaya devam eder.
Sezgin abinin kayıtları güncellemeden etkilenmez.

## Yapılmaması gerekenler

- Depoyu (`sezgin-usta`) **silme** ya da **adını değiştirme**: ana ekrandaki ikon bu adrese bağlı.
- Sezgin abi ana ekrandaki ikonu **silmesin**: kayıtlar ikonla birlikte silinir (önce yedek alınmalı).

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Uygulamanın sayfası |
| `style.css` | Görünüm |
| `app.js` | Randevular, müşteriler, mikrofon, yedek |
| `nlu.js` | Türkçe sesli komutları anlayan bölüm (internetsiz çalışır) |
| `sw.js` | İnternetsiz açılma |
| `manifest.webmanifest`, `icon-*.png` | Ana ekran ikonu ve adı |
