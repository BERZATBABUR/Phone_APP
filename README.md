# Telefon Rehberi Uygulaması

Basit bir **telefon rehberi** uygulaması. Kişi ekleme, listeleme, güncelleme ve silme işlemlerini destekleyen bir **ASP.NET Core Web API** ve bunu kullanan bir **Angular** arayüzü içerir.

## Proje Yapısı

- `TelefonRehberApi`: ASP.NET Core 8 Web API
  - `Models/Contact.cs`: Kişi entity'si
  - `Data/ApplicationDbContext.cs`: EF Core DbContext
  - `Controllers/ContactsController.cs`: CRUD endpoint'leri (`/api/contacts`)
- `telefon-rehber-ui`: Angular 17 (standalone components)
  - `src/app/app.component.*`: Telefon rehberi ekranı (liste + form)

## Kullanılan Teknolojiler

- **Backend**
  - .NET 8, ASP.NET Core Web API
  - Entity Framework Core + SQL Server
- **Frontend**
  - Angular 17 (standalone, reactive forms)
  - HTML / SCSS
- **Veritabanı**
  - Microsoft SQL Server (lokal veya Docker ile)

## Çalıştırma Adımları

### 1. SQL Server başlat

Eğer makinenizde SQL Server yoksa, Docker ile hızlıca başlatabilirsin:

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" \
  -p 1433:1433 --name telefon-rehber-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

> Not: Parola, `TelefonRehberApi/appsettings.json` içindeki `DefaultConnection` ile uyumlu olmalı.

Gerekirse bağlantı cümlesini **`appsettings.json`** içinde güncelleyebilirsin:

- `Server=localhost,1433;Database=TelefonRehberDb;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;`

### 2. Veritabanı migration'larını oluştur / güncelle

Projeyi ilk kez klonladıysan:

```bash
cd TelefonRehberApi
dotnet ef database update
```

> (Migration şimdiden eklendi: `InitialCreate`. Sadece `update` komutunu çalıştırman yeterli.)

### 3. Backend (API) çalıştır

```bash
cd TelefonRehberApi
dotnet run
```

Varsayılan adresler:

- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`

Swagger arayüzü (development'ta açık):

- `https://localhost:5001/swagger`

### 4. Frontend (Angular) çalıştır

Ayrı bir terminalde:

```bash
cd telefon-rehber-ui
npm install   # (ilk sefer)
npm start     # veya: npm run start
```

Angular, varsayılan olarak şu adreste çalışır:

- `http://localhost:4200`

API CORS ayarı şimdiden **`http://localhost:4200`** (ve https) için açıldı.

## Uygulama Özellikleri

- **Kişi ekleme**
  - Zorunlu alanlar: Ad, Soyad, Telefon
  - Opsiyonel: E‑posta, Adres, Notlar
- **Kişi listeleme**
  - Tabloda tüm kişiler gösterilir.
  - İsim, telefon, e‑posta ve adres alanlarında arama yapılabilir.
- **Kişi güncelleme**
  - Listeden "Düzenle" ile form doldurulur, kaydedilir.
- **Kişi silme**
  - "Sil" butonu ile, onay diyaloğu sonrası kişi silinir.

## Önemli Dosyalar (Özet)

- Backend
  - `Models/Contact.cs` – Kişi modeli
  - `Data/ApplicationDbContext.cs` – EF Core context + konfigürasyon
  - `Controllers/ContactsController.cs` – `GET/POST/PUT/DELETE /api/contacts`
  - `Program.cs` – DI, EF Core, CORS, Swagger vb. ayarlar
- Frontend
  - `src/app/app.component.ts` – Angular component (state, HTTP çağrıları, form logic)
  - `src/app/app.component.html` – UI (liste + form)
  - `src/app/app.component.scss` – Modern, responsive tasarım stilleri

Bu noktadan sonra, ister tasarımı geliştirebilir, ister ekstra alanlar (ör. grup, favori, etiketler) ekleyebilirsin.

---

## Gerçek dünya (production) kullanımı

- **Loglama:** Tüm CRUD işlemleri **NLog** ile `TelefonRehberApi/logs/` altına ve konsola yazılır.
- **Yapılandırma:** Production’da bağlantı cümlesi ve CORS için ortam değişkeni kullan:
  - `ConnectionStrings__DefaultConnection` – SQL Server bağlantı cümlesi
  - `CORS__Origins` – Virgülle ayrılmış izin verilen origin listesi (örn. `https://myapp.com`)
- **Kullanıcı geri bildirimi:** Ekleme, güncelleme ve silme sonrası yeşil başarı mesajı gösterilir; hata durumunda kırmızı mesaj.
- **Veritabanı:** Uygulama açılışında bekleyen migration’lar otomatik uygulanır (`Database.Migrate()`).

### Docker Compose ile çalıştırma

SQL Server + API’yi birlikte ayağa kaldırmak için:

```bash
docker compose up -d
```

- **API:** `http://localhost:8080` (Swagger: `http://localhost:8080/swagger`)
- **Frontend:** Aynı makinede `cd telefon-rehber-ui && npm start` çalıştır. Geliştirme sunucusu `/api` isteklerini `proxy.conf.json` ile API’ye yönlendirir; proxy hedefini (varsayılan `https://localhost:7024`) kullandığın API portuna göre güncelle. Docker’da API 8080’de çalışıyorsa proxy’yi `http://localhost:8080` yap.

Production’da Angular’ı build edip (`npm run build`) aynı sunucuda (IIS, Nginx vb.) API ile birlikte sunabilirsin; CORS’ta UI’nin adresini `CORS__Origins` ile eklemeyi unutma.

