# 📊 Control de Gastos

Aplicación web moderna para la gestión, registro y auditoría de gastos corporativos y personales, desarrollada con **Next.js 16**, **Prisma ORM**, **MySQL**, **Auth.js v5**, **Vercel Blob** y **Google Gemini AI** para el análisis inteligente/OCR de comprobantes.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) + React 19
- **Estilos:** Tailwind CSS v4 + UI Components (Lucide Icons, Sonner)
- **Base de Datos:** MySQL (con [Prisma ORM](https://www.prisma.io/))
- **Autenticación:** [Auth.js (NextAuth v5)](https://authjs.dev/) con encriptación bcryptjs
- **Almacenamiento:** Vercel Blob (para imágenes de comprobantes y facturas)
- **IA / OCR:** Google Gemini API (`@google/generative-ai`)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de contar con lo siguiente instalado y listo en tu máquina:

- **Node.js**: `v18.18.0` o superior (se recomienda `v20.x` o posterior).
- **npm** (incluido con Node.js) o `pnpm`/`yarn`/`bun`.
- **Servidor MySQL**:
  - Instancia local activa (ej. MySQL Workbench, XAMPP, MariaDB) **o**
  - Contenedor Docker con MySQL **o**
  - Base de datos en la nube (ej. VPS, PlanetScale, Supabase/Aiven MySQL).

---

## 🚀 Paso a Paso para Levantar el Proyecto

### 1. Clonar el repositorio y entrar a la carpeta

```bash
git clone <URL_DEL_REPOSITORIO>
cd ControlGastos
```

### 2. Instalar dependencias

Instala todas las dependencias del proyecto y genera el cliente de Prisma:

```bash
npm install
```

> *Nota:* Al finalizar la instalación se ejecutará automáticamente `prisma generate` gracias al script `postinstall`.

---

### 3. Configurar variables de entorno

Copia el archivo de ejemplo `.env.local.example` y renómbralo a `.env.local` (o `.env`):

```bash
cp .env.local.example .env.local
```

Edita `.env.local` ajustando los valores correspondientes:

```env
# ─── Base de Datos MySQL ──────────────────────────────────────────────────────
# Ajusta con tu usuario, contraseña, host, puerto y nombre de BD
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/control_gastos"

# ─── Auth.js v5 ───────────────────────────────────────────────────────────────
# Puedes generar una clave segura en terminal con: openssl rand -hex 32
AUTH_SECRET="tu_secret_seguro_generado_aqui"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# ─── Vercel Blob (Opcional en desarrollo si no subes imágenes) ────────────────
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXXXXXXXX"

# ─── Google Gemini (Opcional si no usas escaneo IA) ───────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY="AIzaXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

---

### 4. Preparar la Base de Datos y Semilla (Seed)

Asegúrate de que la base de datos MySQL indicada en `DATABASE_URL` existe (o que MySQL tiene permisos para crearla). Luego ejecuta:

1. **Sincronizar el esquema de Prisma con la BD:**
   ```bash
   npm run db:push
   ```

2. **Cargar los datos iniciales (Centros de costo y Usuarios de prueba):**
   ```bash
   npm run db:seed
   ```

#### 🔑 Credenciales por Defecto (generadas por el Seed)

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@empresa.com` | `Admin123!` |
| **Usuario Regular** | `usuario@empresa.com` | `User123!` |

---

### 5. Iniciar el Servidor de Desarrollo

Ejecuta el comando para levantar Next.js en modo desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.

---

## 📜 Comandos Útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000`. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run start` | Inicia la versión compilada en modo producción. |
| `npm run lint` | Ejecuta ESLint para detectar errores de código. |
| `npm run db:push` | Aplica los cambios del esquema de Prisma a la BD sin migraciones complejas. |
| `npm run db:seed` | Ejecuta el script de poblamiento de datos (`prisma/seed.ts`). |
| `npm run db:studio` | Abre la interfaz visual de Prisma Studio para explorar la BD (`http://localhost:5555`). |

---

## 📁 Estructura Principal del Proyecto

```text
ControlGastos/
├── prisma/
│   ├── schema.prisma   # Definición de modelos (User, CostCenter, Expense)
│   └── seed.ts         # Datos de prueba iniciales
├── public/             # Archivos estáticos
├── src/
│   ├── app/            # Rutas y páginas (Next.js App Router)
│   ├── components/     # Componentes de UI reutilizables
│   └── lib/            # Configuraciones (Prisma client, Auth, etc.)
├── .env.local.example  # Plantilla de variables de entorno
├── ecosystem.config.js # Configuración PM2 para producción
├── next.config.ts      # Configuración de Next.js (con soporte de basePath)
├── package.json
└── README.md
```

---

## 🌐 Despliegue en Servidor VPS (Producción)

A continuación se detalla la guía paso a paso para desplegar la aplicación en un servidor Linux (Ubuntu/Debian) usando **Node.js**, **PM2**, **MySQL** y **Nginx** (con soporte para subrutas o convivencia con otros sitios como Angular).

### 1. Prerrequisitos en el VPS
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx mysql-server

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

---

### 2. Configurar la Base de Datos MySQL
```sql
sudo mysql -u root -p

CREATE DATABASE control_gastos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'control_user'@'localhost' IDENTIFIED BY 'c0ntr0l_g4st0s!';
GRANT ALL PRIVILEGES ON control_gastos_db.* TO 'control_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 3. Clonar y Configurar la Aplicación
```bash
cd /var/www
git clone https://github.com/luisrs-dev/Control-de-gastos.git
cd Control-de-gastos
npm install
```

Crear el archivo `.env` en producción:
```bash
nano .env
```

```env
# ─── Base de Datos ────────────────────────────────────────────────────────────
DATABASE_URL="mysql://gastos_user:TU_PASSWORD_SEGURO@localhost:3306/control_gastos"

# ─── Configuración de Subruta (Opcional, ej: http://31.97.9.216/controlgastos) ─
NEXT_PUBLIC_BASE_PATH="/controlgastos"
NEXTAUTH_URL="http://31.97.9.216/controlgastos"

# ─── Auth.js v5 ───────────────────────────────────────────────────────────────
AUTH_SECRET="tu_secret_de_produccion_aqui"
AUTH_TRUST_HOST=true

# ─── Integraciones ────────────────────────────────────────────────────────────
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXXXXXXXXXXXXX"
GOOGLE_GENERATIVE_AI_API_KEY="AIzaXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

Migrar base de datos y compilar:
```bash
npx prisma db push
npm run db:seed
npm run build
```

---

### 4. Levantar con PM2 (`ecosystem.config.js`)
El proyecto incluye un archivo `ecosystem.config.js` optimizado para PM2:

```bash
# Iniciar la app por primera vez
pm2 start ecosystem.config.js --env production

# Guardar la lista de procesos para reinicios del VPS
pm2 save
pm2 startup
```

Para reiniciar la aplicación tras futuros cambios (`git pull && npm run build`):
```bash
pm2 restart control-gastos
```

---

### 5. Configurar Nginx (Convivencia con otros proyectos)

Abre el archivo de configuración de Nginx (ej: `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name 31.97.9.216; # o tudominio.com

    # Proyecto existente (ej. Angular)
    location /joseluisjara/ {
        # ... configuración existente de Angular ...
    }

    # Proyecto Control de Gastos (Next.js)
    location /controlgastos/ {
        proxy_pass http://127.0.0.1:3001/controlgastos/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

Recargar Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

