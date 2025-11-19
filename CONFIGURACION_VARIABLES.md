# 🔐 Guía de Configuración de Variables de Entorno

Esta guía te ayuda a configurar las variables de entorno necesarias para desplegar SimSmile (Punto 2 de "What's Next").

## 📋 Paso a Paso

### 1️⃣ Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Haz clic en el ícono de ⚙️ Settings (Configuración)
3. Selecciona **API** en el menú lateral
4. Copia los siguientes valores:
   - **Project URL** → Esta es tu `VITE_SUPABASE_URL`
   - **anon/public key** → Esta es tu `VITE_SUPABASE_ANON_KEY`

### 2️⃣ Configurar Variables Localmente (Para Desarrollo)

Si vas a ejecutar el proyecto localmente:

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env

# 2. Edita el archivo .env con tus valores reales
nano .env  # o usa tu editor preferido
```

Reemplaza los valores de ejemplo con tus credenciales reales:
```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_real_aqui
```

### 3️⃣ Configurar Variables en Vercel (Recomendado)

Si vas a desplegar en Vercel:

#### Opción A: Mediante CLI
```bash
# Después de ejecutar 'vercel', configura las variables:
vercel env add VITE_SUPABASE_URL
# Pega tu URL cuando se te solicite

vercel env add VITE_SUPABASE_ANON_KEY
# Pega tu clave cuando se te solicite
```

#### Opción B: Mediante Dashboard
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto SimSmile
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable:
   - Click en **Add New**
   - Name: `VITE_SUPABASE_URL`
   - Value: Tu URL de Supabase
   - Environments: Marca todas (Production, Preview, Development)
   - Click **Save**
5. Repite para `VITE_SUPABASE_ANON_KEY`

### 4️⃣ Configurar Variables en Netlify

Si vas a desplegar en Netlify:

#### Opción A: Mediante CLI
```bash
# Durante netlify init, puedes configurarlas, o después:
netlify env:set VITE_SUPABASE_URL "https://tu-proyecto-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "tu_clave_anon_real"
```

#### Opción B: Mediante Dashboard
1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Selecciona tu sitio SimSmile
3. Ve a **Site configuration** → **Environment variables**
4. Click en **Add a variable**
5. Agrega:
   - Key: `VITE_SUPABASE_URL`
   - Values: Tu URL de Supabase
   - Scopes: Todas las opciones
6. Repite para `VITE_SUPABASE_ANON_KEY`

## ✅ Verificar Configuración

Después de configurar las variables:

### Verificación Local
```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. Abre http://localhost:8080 en tu navegador
# 3. Verifica que la aplicación cargue sin errores en la consola del navegador
```

### Verificación en Producción
```bash
# Para Vercel
vercel --prod

# Para Netlify
netlify deploy --prod

# Luego visita tu URL de producción y verifica:
# - La aplicación carga correctamente
# - La cámara funciona (requiere HTTPS)
# - Puedes subir una imagen
# - El análisis AI se completa
```

## 🔍 Solución de Problemas

### Error: "Supabase client not initialized"
- ✅ Verifica que las variables estén configuradas correctamente
- ✅ Asegúrate de que los nombres de las variables sean exactos (distinguen mayúsculas)
- ✅ Reinicia el servidor después de cambiar las variables

### Error: "Invalid API key"
- ✅ Verifica que copiaste la clave completa (son muy largas)
- ✅ Asegúrate de usar la clave **anon/public** no la clave **service_role**
- ✅ Verifica que no haya espacios adicionales al principio o final

### Las variables no se aplican en producción
- ✅ Espera unos minutos, a veces toma tiempo propagarse
- ✅ Haz un nuevo deploy después de agregar las variables
- ✅ Verifica que marcaste el ambiente correcto (Production)

## 📝 Variables Opcionales

Una vez que las variables **REQUERIDAS** funcionen, puedes agregar variables opcionales según necesites:

```env
# Analytics
VITE_ENABLE_ANALYTICS=true
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking
VITE_ENABLE_ERROR_REPORTING=true
VITE_SENTRY_DSN=https://...@sentry.io/...

# Performance
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_API_TIMEOUT=30000

# Security
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=20
```

## 🎯 Resumen

### Variables Mínimas Requeridas:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Comandos Rápidos:

**Para Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

**Para Netlify:**
```bash
netlify env:set VITE_SUPABASE_URL "tu-url"
netlify env:set VITE_SUPABASE_ANON_KEY "tu-clave"
netlify deploy --prod
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Variables de Entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Variables en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Variables en Netlify](https://docs.netlify.com/environment-variables/overview/)

---

**¿Necesitas ayuda?** Revisa el archivo `DEPLOYMENT.md` para más detalles o consulta el `README.md` para información de contacto.
