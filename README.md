# Choozify - Landing Page

Landing page estática para presentar el proyecto Choozify en la hackathon.

## Estructura del Proyecto

- `index.html` - Estructura HTML principal
- `styles.css` - Estilos CSS modernos y responsivos
- `script.js` - JavaScript para interactividad (navegación móvil, scroll suave, animaciones)

## Características

- ✅ Diseño moderno y atractivo
- ✅ Totalmente responsivo (mobile-first)
- ✅ Animaciones suaves al hacer scroll
- ✅ Navegación móvil con menú hamburguesa
- ✅ Secciones destacadas:
  - Hero con call-to-action
  - Características principales del producto
  - Cómo funciona (para arrendadores y arrendatarios)
  - Stack tecnológico
  - Footer con información de contacto

## 🚀 Despliegue en Render

### Guía Rápida

1. **Prepara tu repositorio en GitHub/GitLab/Bitbucket**
2. **Crea una cuenta en [Render](https://render.com)**
3. **Crea un nuevo "Static Site"**
4. **Conecta tu repositorio**
5. **Configuración:**
   - **Build Command:** (dejar vacío)
   - **Publish Directory:** (dejar vacío o `/`)
6. **¡Despliega!**

### 📖 Guía Detallada

Para una guía paso a paso completa, consulta el archivo **[DEPLOY.md](./DEPLOY.md)** que incluye:
- Instrucciones detalladas paso a paso
- Configuración completa
- Solución de problemas comunes
- Checklist de verificación

## Desarrollo Local

Para ver la página localmente, puedes usar:

```bash
# Opción 1: Python
python3 -m http.server 8000

# Opción 2: Node.js (si tienes http-server instalado)
npx http-server

# Opción 3: PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Personalización

- **Colores:** Modifica las variables CSS en `:root` dentro de `styles.css`
- **Contenido:** Edita el texto directamente en `index.html`
- **Animaciones:** Ajusta las transiciones en `styles.css` y `script.js`
