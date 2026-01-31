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

## Despliegue en Render

Para desplegar esta landing page en Render:

1. **Opción 1: Static Site**
   - Conecta tu repositorio a Render
   - Selecciona "Static Site" como tipo de servicio
   - Build Command: (dejar vacío)
   - Publish Directory: `/` (raíz del proyecto)

2. **Opción 2: Usando un servidor simple**
   - Puedes usar cualquier servidor estático como `serve` o `http-server`
   - O simplemente apuntar Render a los archivos estáticos

3. **Configuración recomendada en Render:**
   - **Build Command:** (vacío)
   - **Publish Directory:** `/`
   - **Environment:** Static Site

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
