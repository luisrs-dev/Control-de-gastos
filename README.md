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
├── package.json
└── README.md
```
