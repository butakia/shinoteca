# Shinoteca

Archivo musical comunitario — fundación del proyecto (Next.js 16 App Router + TypeScript + Tailwind v4).

Esta es la **primera fase**: navegación, biblioteca, reproductor real, favoritos, playlists,
comentarios locales, panel administrativo de demostración y sistema de carátulas con fallback.
Quedan fuera de esta fase (ver historial de la conversación para el resto de la especificación):
visualizador de audio en tiempo real conectado a Web Audio API, subida real de archivos/carátulas,
múltiples fuentes de audio externas, detección de metadatos ID3, y el motor de mezclas/recomendaciones
avanzado. El reproductor ya reserva el espacio visual para el visualizador.

## Empezar

```bash
npm install
npm run dev
```

Abre http://localhost:3000 (o el puerto configurado).

## Qué es local y qué requeriría backend

**Todo funciona en el navegador (modo demo) ahora mismo:**
- Catálogo de canciones: `src/lib/data/*.ts` (datos ficticios de ejemplo).
- Favoritos, me gusta/no me gusta, historial, reproducciones, playlists, comentarios, búsquedas
  recientes: `localStorage`, ver `src/lib/storage.ts` y `src/hooks/usePersistentState.ts`.
- Sesión de administrador: `src/context/AuthContext.tsx` — credenciales de ejemplo
  (`admin` / `shinoflow-demo`) **solo para previsualizar la interfaz**, no es autenticación real.
- Audio: archivos de prueba sintéticos en `public/music/` (tonos generados, no música real —
  ver `scripts/generate-demo-audio.mjs`).

**Para producción hace falta:**
- Base de datos para canciones/álbumes/usuarios (sustituir `src/lib/data/index.ts` por consultas reales,
  el resto de la app ya consume solo esas funciones).
- Autenticación real con sesiones verificadas en servidor.
- Almacenamiento de archivos de audio/carátulas (S3, Supabase Storage, Bunny.net, Cloudinary, etc.),
  con claves solo en variables de entorno del servidor.
- Backend para comentarios (moderación real) y estadísticas.

## Sustituir el catálogo de ejemplo

Edita `src/lib/data/songs.ts`, `albums.ts` y `artists.ts` siguiendo los tipos de `src/lib/types.ts`.
Coloca archivos de audio autorizados en `public/music/` (o cambia `audioSources` a una URL externa).
Cada canción solo debe publicarse cuando exista autorización, consentimiento o base legítima —
ver `/creditos`, `/terminos` y `/solicitar-retiro`.

## Variables de entorno

Ninguna es obligatoria en esta fase local. Antes de conectar almacenamiento externo o base de datos,
añade un `.env.local` (no lo subas al repositorio) con las claves del proveedor elegido y léelas
solo desde código de servidor.

## PWA

`public/manifest.json` + `public/sw.js` (cache-shell mínimo, solo activo en producción — ver
`src/components/layout/ServiceWorkerRegistration.tsx`). Los iconos se generan con
`node scripts/generate-icons.mjs`.

## Desplegar en Vercel

```bash
npm run build
```

Sube el repositorio a Vercel; no requiere configuración adicional para esta fase (no hay base de datos).
