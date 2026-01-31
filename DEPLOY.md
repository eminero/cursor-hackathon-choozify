# Guía de Despliegue en Render

Esta guía te ayudará a desplegar la landing page de Choozify en Render paso a paso.

## 📋 Requisitos Previos

1. Una cuenta en [Render](https://render.com) (puedes crear una gratis con GitHub)
2. Tu código en un repositorio Git (GitHub, GitLab o Bitbucket)
3. Los archivos del proyecto listos para desplegar

## 🚀 Pasos para Desplegar

### Paso 1: Preparar el Repositorio

1. **Inicializa Git** (si aún no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Choozify landing page"
   ```

2. **Crea un repositorio en GitHub**:
   - Ve a [GitHub](https://github.com)
   - Crea un nuevo repositorio (público o privado)
   - Conecta tu repositorio local:
     ```bash
     git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
     git branch -M main
     git push -u origin main
     ```

### Paso 2: Conectar con Render

1. **Inicia sesión en Render**:
   - Ve a [render.com](https://render.com)
   - Inicia sesión con tu cuenta de GitHub (recomendado)

2. **Crea un nuevo servicio**:
   - Haz clic en el botón **"New +"** en el dashboard
   - Selecciona **"Static Site"**

### Paso 3: Configurar el Servicio

Completa el formulario con la siguiente información:

#### Información Básica:
- **Name**: `choozify-landing` (o el nombre que prefieras)
- **Repository**: Selecciona tu repositorio de GitHub
- **Branch**: `main` (o la rama donde está tu código)

#### Configuración de Build:
- **Build Command**: **DEJAR VACÍO** (no necesitas build para HTML estático)
- **Publish Directory**: **DEJAR VACÍO** o poner `/` (raíz del proyecto)

#### Configuración Avanzada (opcional):
- **Environment**: `Static Site`
- **Auto-Deploy**: `Yes` (se actualiza automáticamente cuando haces push)

### Paso 4: Desplegar

1. Haz clic en **"Create Static Site"**
2. Render comenzará a desplegar tu sitio
3. Espera 1-2 minutos mientras Render procesa el despliegue
4. Una vez completado, verás una URL como: `https://choozify-landing.onrender.com`

### Paso 5: Verificar el Despliegue

1. Haz clic en la URL proporcionada por Render
2. Verifica que tu landing page se vea correctamente
3. Prueba todas las funcionalidades:
   - Navegación
   - Carrusel de propiedades
   - Enlaces
   - Responsive design

## 🔧 Configuración Adicional (Opcional)

### Personalizar el Dominio

1. En el dashboard de Render, ve a tu servicio
2. Haz clic en **"Settings"**
3. En la sección **"Custom Domain"**, agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

### Variables de Entorno

Para este proyecto no necesitas variables de entorno, pero si las necesitas en el futuro:
1. Ve a **"Environment"** en la configuración de tu servicio
2. Agrega las variables necesarias

### Configuración de HTTPS

Render proporciona HTTPS automáticamente para todos los sitios estáticos. No necesitas configuración adicional.

## 📝 Estructura de Archivos Requerida

Asegúrate de que tu repositorio tenga esta estructura:

```
choozify-landing/
├── index.html
├── styles.css
├── script.js
├── README.md
└── (otros archivos opcionales)
```

## 🐛 Solución de Problemas

### El sitio no se despliega

1. **Verifica que el repositorio esté conectado correctamente**
2. **Revisa los logs de build** en Render:
   - Ve a tu servicio → "Logs"
   - Busca errores en rojo

### Las imágenes no se cargan

1. **Verifica las URLs de las imágenes**:
   - Si usas Unsplash, las URLs deben ser completas
   - Si usas imágenes locales, asegúrate de que estén en el repositorio

### El sitio se ve mal en móviles

1. **Verifica el viewport** en `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

### El carrusel no funciona

1. **Verifica que `script.js` esté cargado**:
   ```html
   <script src="script.js"></script>
   ```
2. **Revisa la consola del navegador** para errores de JavaScript

## 🔄 Actualizar el Sitio

Cada vez que hagas cambios:

1. **Haz commit de tus cambios**:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```

2. **Render detectará automáticamente** el cambio y desplegará la nueva versión
3. **Espera 1-2 minutos** para que el despliegue se complete

## 💰 Planes de Render

- **Free Tier**: Perfecto para proyectos personales y hackathons
  - Sitios estáticos gratuitos
  - HTTPS automático
  - Auto-deploy desde Git
  - Puede "dormir" después de inactividad (se despierta automáticamente)

- **Paid Plans**: Para proyectos profesionales con más recursos

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Guía de Static Sites en Render](https://render.com/docs/static-sites)
- [Soporte de Render](https://render.com/docs/support)

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Repositorio en GitHub/GitLab/Bitbucket
- [ ] Servicio creado en Render
- [ ] Build Command vacío
- [ ] Publish Directory vacío o `/`
- [ ] Sitio accesible en la URL de Render
- [ ] Todas las imágenes cargan correctamente
- [ ] Navegación funciona
- [ ] Carrusel funciona
- [ ] Responsive design funciona en móviles
- [ ] Enlaces funcionan correctamente

¡Listo! Tu landing page de Choozify debería estar funcionando en Render. 🎉
