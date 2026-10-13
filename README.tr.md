# Orvexa

Orvexa, ekiplerin projelerini, görevlerini, müşterilerini ve ekip üyelerini tek bir çalışma alanında yönetmelerine yardımcı olmak için tasarlanmış bir proje yönetimi web uygulamasıdır. React ve TypeScript ile geliştirilmiş bir ön yüz ile Spring Boot tabanlı bir REST API'den oluşur.

[English](README.md) | [Türkçe](README.tr.md)

**Canlı Demo:** [https://orvexa-gsz3.onrender.com](https://orvexa-gsz3.onrender.com)

## Ekran Görüntüleri

| Gösterge Paneli | Projeler |
| --- | --- |
| ![Gösterge Paneli](docs/screenshots/dashboard.png) | ![Projeler](docs/screenshots/projects.png) |

| Görevler | Ekip |
| --- | --- |
| ![Görevler](docs/screenshots/tasks.png) | ![Ekip](docs/screenshots/team.png) |

Diğer ekran görüntüleri [`docs/screenshots`](docs/screenshots) dizininde bulunabilir.

## Özellikler

- **Kimlik doğrulama:** kullanıcı kaydı, giriş, oturum yönetimi ve çıkış
- **Gösterge paneli:** proje ilerlemesi, görev durumu özetleri, yaklaşan görevler ve son etkinlikler
- **Proje yönetimi:** proje oluşturma, görüntüleme, güncelleme, silme ve filtreleme
- **Görev yönetimi:** görev oluşturma, görüntüleme, güncelleme, silme ve filtreleme
- **Müşteri yönetimi:** müşteri bilgilerini ve ilgili ayrıntıları yönetme
- **Ekip yönetimi:** çalışma alanı üyeliği ve ekip davet arayüzü
- **Etkinlik akışı:** son etkinlikleri görüntüleme
- **Ayarlar:** çalışma alanı ayarları arayüzü

Orvexa'nın geliştirilmesine aktif olarak devam edilmektedir. Canlı uygulamadaki özelliklerin kullanılabilirliği, arka uç servisinin ve veritabanının doğru yapılandırılmış ve erişilebilir olmasına bağlıdır.

## Teknoloji Yığını

### Ön Yüz (Frontend)

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Recharts
- Lucide React

### Arka Uç (Backend)

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Flyway veritabanı geçişleri
- Bean Validation

### Veritabanı ve Geliştirme Araçları

- PostgreSQL
- Docker
- Docker Compose
- Maven

## Proje Yapısı

```text
orvexa/
├── src/
│   ├── api/                     # API isteklerinin yönetimi
│   ├── components/              # Yeniden kullanılabilir arayüz bileşenleri
│   ├── contexts/                # Kimlik doğrulama dahil React context'leri
│   ├── pages/                   # Uygulama sayfaları
│   ├── services/                # Ön yüz servis katmanı
│   └── ...
├── backend/
│   ├── src/main/java/           # Spring Boot uygulaması
│   ├── src/main/resources/      # Yapılandırma ve veritabanı geçişleri
│   ├── Dockerfile
│   ├── compose.yaml             # Yerel PostgreSQL servisi
│   └── test.sh                  # Arka uç test betiği
├── docs/
│   └── screenshots/
└── package.json
```

## Başlarken

### Ön Koşullar

- Node.js ve npm
- Java 21
- Docker ve Docker Compose

### 1. Veritabanını yapılandırma

Depodaki `backend/` dizininde `backend/.env` dosyasını oluştur:

```dotenv
DB_NAME=orvexa_db
DB_USERNAME=orvexa
DB_PASSWORD=change-this-local-password
```

Yerel ortamına uygun bir parola belirle. Kimlik bilgilerini veya üretim ortamına ait gizli değerleri Git deposuna gönderme.

PostgreSQL'i başlat:

```bash
cd backend
docker compose up -d
```

Arka uç uygulaması başlatıldığında veritabanı şeması Flyway tarafından yönetilir.

### 2. Arka ucu çalıştırma

`backend/` dizinindeyken ortam değişkenlerini yükle ve Spring Boot uygulamasını başlat:

```bash
set -a
source .env
set +a
./mvnw spring-boot:run
```

Arka uç, varsayılan olarak `8080` portunu kullanır. Varsayılan yerel veritabanı bağlantı adresi şöyledir:

```text
jdbc:postgresql://localhost:5432/orvexa_db
```

### 3. Ön ucu çalıştırma

Yeni bir terminal aç ve depo kök dizinine git:

```bash
cd ~/orvexa
npm install
npm run dev
```

Ardından [http://localhost:5173](http://localhost:5173) adresini aç.

Yerel geliştirme sırasında Vite, `/api` ile başlayan istekleri `http://localhost:8080` adresindeki arka uca yönlendirir.

## Testler ve Kod Kalitesi

Ön yüz lint kontrollerini çalıştır:

```bash
npm run lint
```

Ön yüzün üretim derlemesini oluştur:

```bash
npm run build
```

Arka uç test betiğini çalıştır:

```bash
cd backend
./test.sh
```

## Dağıtım (Deployment)

### Ön Yüz

Ön yüz Render üzerinde yayımlanmaktadır:

[https://orvexa-gsz3.onrender.com](https://orvexa-gsz3.onrender.com)

### Arka Uç

Depoda, Spring Boot uygulamasını bir konteyner içinde derleyip çalıştırmak için `backend/Dockerfile` bulunmaktadır. Docker imajı `prod` Spring profilini etkinleştirir.

Arka ucun üretim yapılandırması aşağıdaki ortam değişkenlerini destekler:

| Değişken | Amacı |
| --- | --- |
| `DB_URL` | PostgreSQL JDBC bağlantı adresi |
| `DB_USERNAME` | Veritabanı kullanıcı adı |
| `DB_PASSWORD` | Veritabanı parolası |
| `PORT` | Sunucu portu; varsayılan değer `8080` |

API kullanan özelliklerin üretim ortamında çalışabilmesi için arka ucun ve veritabanının dağıtılmış ve doğru yapılandırılmış olması gerekir. Ayrıca CORS, oturum çerezleri ve CSRF koruması, yayımlanan ön yüz ve arka uç adreslerine uygun şekilde yapılandırılmalıdır.

## Proje Durumu

Orvexa, geliştirilmesi devam eden bir full-stack projedir. Depodaki dokümantasyon mevcut uygulamayı ve kurulum adımlarını açıklar; herkese açık dağıtımda tüm özelliklerin sorunsuz çalıştığı varsayılmamalıdır.