# RACHAPP

Tracker personal de hábitos diarios. Pixel art aesthetic, en español rioplatense.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS**
- Deploy: **Vercel**

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto nuevo.
2. En **Settings → API**, copiar la `Project URL` y `anon public` key.

### 3. Variables de entorno

Editar `.env.local` con tus credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 4. Ejecutar el schema SQL

En el **SQL Editor** de Supabase, pegar y ejecutar el contenido de `supabase/schema.sql`.

### 5. Desayunos default

Después de crear tu usuario, ejecutar en el SQL Editor (reemplazá `<user-id>` con tu UUID de `auth.users`):

```sql
INSERT INTO breakfast_options (user_id, label) VALUES
  ('<user-id>', 'Solo café con leche'),
  ('<user-id>', 'Avocado Toast'),
  ('<user-id>', 'Medialunas de jamón y queso');
```

O agregarlos directamente desde el formulario diario.

### 6. Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura

```
app/
  (app)/              # Rutas protegidas (requieren auth)
    layout.tsx        # Layout con navbar
    log/              # Formulario diario
    reports/          # Estadísticas y KPIs
    goals/            # Objetivos por hábito
    settings/         # Configuración y hábitos personalizados
  page.tsx            # Login (/)
components/
  LoginForm.tsx
  NavBar.tsx
lib/
  supabase.ts         # Cliente browser
  supabase-server.ts  # Cliente server
types/
  index.ts
supabase/
  schema.sql          # Schema completo de la DB
```

## Deploy en Vercel

1. Conectar el repo en Vercel.
2. Agregar las env vars en el dashboard de Vercel.
3. Deploy automático en cada push a `main`.
