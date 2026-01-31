# Choozify - RentalMatch MVP

Choozify es un marketplace inteligente que conecta arrendadores y arrendatarios usando tecnología de IA para hacer coincidencias perfectas.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn UI
- **Backend/DB:** Supabase (PostgreSQL + PostGIS)
- **AI:** OpenAI GPT-4 (chat search)
- **State Management:** React Query
- **Maps:** React-Leaflet (PostGIS)

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase
- Cuenta de OpenAI con API key

## 🛠️ Configuración Local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd cursor-hackathon-choozify
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
```

**Para obtener las credenciales de Supabase:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a Settings > API
4. Copia la `URL` y la `anon/public key`

**Para obtener la API key de OpenAI:**
1. Ve a [OpenAI Platform](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a API Keys
4. Crea una nueva API key

### 4. Configurar la base de datos

Ejecuta el script de schema en tu proyecto de Supabase:

```bash
# Desde el Supabase Dashboard, ve a SQL Editor y ejecuta:
cat utils/supabase/schema.sql
```

O usa el CLI de Supabase:

```bash
supabase db push
```

### 5. (Opcional) Insertar datos de ejemplo

```bash
# Desde el Supabase SQL Editor:
cat utils/supabase/Insert.sql
```

### 6. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/                          # Next.js App Router
│   ├── (app)/                   # Rutas autenticadas
│   │   ├── tenant/              # Dashboard de arrendatarios
│   │   ├── landlord/            # Dashboard de arrendadores
│   │   ├── admin/               # Dashboard de administrador
│   │   ├── properties/          # Listado y detalle de propiedades
│   │   └── components/          # Componentes de la app
│   ├── (marketing)/             # Landing page pública
│   │   └── marketing/           # Página de marketing
│   ├── auth/                    # Páginas de autenticación
│   │   ├── sign-in/            # Inicio de sesión
│   │   └── sign-up/            # Registro
│   └── api/                     # API Routes
│       └── chat/search/         # Endpoint de búsqueda con IA
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes shadcn UI
│   ├── ai/                      # AIChatWidget
│   └── properties/              # Componentes de propiedades
├── lib/                         # Utilidades
│   ├── supabase/               # Clientes de Supabase
│   └── ai/                     # Schemas y configuración de IA
├── types/                       # Definiciones de TypeScript
└── utils/                       # Scripts de utilidad
    └── supabase/               # Scripts y schema de DB
```

## 🎯 Funcionalidades Principales

### Para Arrendatarios (Tenants)
- ✅ Perfil completo con criterios de elegibilidad
- ✅ Búsqueda de propiedades con IA (lenguaje natural)
- ✅ Dashboard con propiedades recomendadas
- ✅ Sistema de aplicaciones
- ✅ Notificaciones de nuevas propiedades

### Para Arrendadores (Landlords)
- ✅ Gestión de propiedades
- ✅ Visualización de aplicaciones
- ✅ Definir criterios de elegibilidad
- ✅ Dashboard con estadísticas

### Características de IA
- 🤖 Chatbot que entiende lenguaje natural
- 🎯 Matching inteligente basado en criterios
- 📍 Expansión geográfica inteligente
- 🔔 Notificaciones contextuales

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Utilidades de Supabase
npm run get-zones           # Consultar zonas
npm run get-zones-http      # Ejemplo HTTP raw
```

## 🌐 Rutas de la Aplicación

### Públicas
- `/marketing` - Landing page
- `/auth/sign-in` - Inicio de sesión
- `/auth/sign-up` - Registro

### Autenticadas (role-based)
- `/` - Redirige al dashboard según rol
- `/tenant/dashboard` - Dashboard de arrendatario
- `/landlord/dashboard` - Dashboard de arrendador
- `/admin/dashboard` - Dashboard de administrador
- `/properties` - Listado de propiedades
- `/properties/[id]` - Detalle de propiedad

## 🔐 Seguridad

- Row-Level Security (RLS) habilitado en todas las tablas
- Middleware de autenticación para rutas protegidas
- Validación de permisos por rol
- API routes protegidas con autenticación

## 📱 Deployment

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

### Otras plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

**Importante:** Asegúrate de configurar las variables de entorno en tu plataforma de deployment.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto fue desarrollado para el Hackathon Cursor.

## 📞 Soporte

Para soporte o preguntas, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para el Hackathon Cursor**
