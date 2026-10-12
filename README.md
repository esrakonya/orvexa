# Orvexa

Orvexa, ekiplerin projelerini, görevlerini ve üyelerini tek yerden yönetmesini sağlayan bir proje yönetim panelidir. React ile geliştirilen arayüz, Spring Boot tabanlı bir REST API ile çalışır.

**Canlı uygulama:** _yakında eklenecek_

## Ekran Görüntüleri

| Dashboard | Projects |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Projects](docs/screenshots/projects.png) |

| Tasks | Team |
| --- | --- |
| ![Tasks](docs/screenshots/tasks.png) | ![Team](docs/screenshots/team.png) |

## Özellikler

- Kayıt olma, giriş yapma ve oturum yönetimi
- Dashboard: proje ilerlemesi, görev durumu özeti, yaklaşan görevler ve son aktiviteler
- Projeler: ekleme, listeleme, güncelleme, silme ve filtreleme
- Görevler: ekleme, listeleme, güncelleme, silme ve filtreleme
- Ekip: çalışma alanı üyeleri ve e-posta daveti ile ekibe katılım
- Müşteriler ve aktivite akışı
- Ayarlar sayfası

## Kullanılan Teknolojiler

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Recharts, Lucide React

**Backend:** Java 21, Spring Boot 4, Spring Security (oturum + CSRF koruması), Spring Data JPA, Flyway

**Veritabanı:** PostgreSQL

## Proje Yapısı

```text
orvexa/
├── src/              # React uygulaması (components, pages, interfaces, services, hooks)
├── backend/          # Spring Boot API (controller, service, repository, entity, dto)
├── public/
└── docs/screenshots/
```

## Yerelde Çalıştırma

Gereksinimler: Node.js, Java 21, Docker

1. `backend/.env` dosyasını oluştur ve şu değerleri yaz: `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
2. Veritabanını başlat:

```bash
   cd backend
   docker compose up -d
```

3. Backend'i başlat (tablolar Flyway ile otomatik kurulur):

```bash
   set -a; source .env; set +a
   ./mvnw spring-boot:run
```

4. Frontend'i başlat (ayrı bir terminalde, proje kök klasöründe):

```bash
   npm install
   npm run dev
```

Arayüz `http://localhost:5173` adresinde açılır. Vite, `/api` isteklerini `http://localhost:8080` adresindeki backend'e yönlendirir.

## Test ve Kontroller

```bash
npm run lint
npm run build
cd backend && ./test.sh
```

## Dağıtım

- Frontend: Netlify
- Backend: Docker (`backend/Dockerfile`), production ayarları `application-prod.properties` içinde
- Veritabanı: yönetilen PostgreSQL

Production ortamında `DB_URL`, `DB_USERNAME` ve `DB_PASSWORD` değişkenleri tanımlanmalıdır.