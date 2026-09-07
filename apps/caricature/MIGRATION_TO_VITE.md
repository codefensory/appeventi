# Migración de Rspack a Vite

## Resumen de cambios

Este proyecto ha sido migrado de Rspack a Vite manteniendo toda la funcionalidad existente, incluyendo Module Federation.

## Archivos modificados

### 1. Nuevas dependencias
- `vite`: Bundler principal
- `@vitejs/plugin-react`: Plugin para React
- `@originjs/vite-plugin-federation`: Plugin para Module Federation

### 2. Archivos de configuración
- **Creado**: `vite.config.mjs` - Configuración principal de Vite
- **Modificado**: `package.json` - Scripts actualizados
- **Modificado**: `index.html` - Agregado script de entrada
- **Modificado**: `src/index.ts` - Cambio de import dinámico a estático

### 3. Scripts actualizados
- `dev`: Usa `vite` en lugar de `rspack serve`
- `build`: Usa `vite build` en lugar de `rspack build`
- `build:dev`: Usa `vite build --mode development`
- `build:start`: Usa `vite preview` para previsualizar el build

### 4. Scripts de respaldo
Se mantuvieron los scripts originales con el sufijo "2" para compatibilidad:
- `dev2`: Script original de desarrollo con Rspack
- `build2`: Script original de build con Rspack
- `build:dev2`: Script original de build de desarrollo con Rspack
- `build:start2`: Script original para servir desde dist

## Características mantenidas

✅ **Module Federation**: Configurado con `@originjs/vite-plugin-federation`
✅ **Variables de entorno**: Las públicas usan `import.meta.env.VITE_*`; las privadas solo están disponibles en las funciones serverless
✅ **React**: Configurado con `@vitejs/plugin-react`
✅ **CSS/PostCSS**: Configurado con PostCSS
✅ **Puerto 8080**: Mantenido tanto para desarrollo como preview
✅ **Hot Module Replacement**: Incluido por defecto en Vite

## Beneficios de la migración

1. **Velocidad**: Vite es significativamente más rápido en desarrollo
2. **Hot Module Replacement**: Actualizaciones instantáneas
3. **Mejor experiencia de desarrollo**: Mejor debugging y error reporting
4. **Ecosystem**: Mejor soporte de plugins y comunidad
5. **Tamaño del bundle**: Optimización automática del bundle

## Comandos para usar

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Build de desarrollo
npm run build:dev

# Previsualizar build
npm run build:start
```

## Notas técnicas

- La configuración está en formato `.mjs` para compatibilidad con ES modules
- Las variables `VITE_*` se exponen al frontend; las credenciales de Turso y OpenAI se mantienen únicamente en el servidor
- El Module Federation funciona igual que antes
- El puerto 8080 se mantiene para compatibilidad con la configuración existente

## Funciones serverless y variables privadas

Las funciones de Vercel están en `api/`:

- `POST /api/contact`: guarda los datos del formulario en Turso.
- `POST /api/generate`: llama a OpenAI sin exponer la clave al navegador.

En Vercel deben configurarse estas variables privadas, sin el prefijo `VITE_`:

```env
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
OPENAI_API_KEY=...
# Solo en el despliegue que expondrá /admin.
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
```

Las únicas variables `VITE_` son las públicas de Cloudinary. Para probar frontend y funciones localmente:

```bash
pnpm dev:vercel
```
