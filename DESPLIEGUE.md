# Desplegar Shinoteca (GitHub + Vercel, todo gratis)

Arquitectura elegida y por qué:

| Pieza | Servicio | Plan gratis | Por qué |
|---|---|---|---|
| Aplicación | **Vercel** | 100 GB tráfico/mes | Límite: **100 MB de archivos fuente** por despliegue |
| Audio (~690 MB) | **Cloudinary** | 25 GB | Por eso el audio NO va en el repositorio: no cabría en Vercel |
| Base de datos | **Turso** | 9 GB / 500 bases | El disco de Vercel es de solo lectura: SQLite local no persiste |
| Código | **GitHub** | ilimitado | El repo queda en ~4 MB |

Sin el audio en el CDN el despliegue **falla** (690 MB > 100 MB). Con esta
configuración el repositorio pesa 4,2 MB.

---

## Paso 1 — Crear las tres cuentas gratuitas

1. **Cloudinary** → https://cloudinary.com/users/register_free
   En el Dashboard copia: `Cloud Name`, `API Key`, `API Secret`.

2. **Turso** → https://turso.tech
   Crea una base de datos y obtén sus dos datos:
   ```bash
   turso db show shinoteca --url      # → TURSO_DATABASE_URL
   turso db tokens create shinoteca   # → TURSO_AUTH_TOKEN
   ```

3. **GitHub** → https://github.com (si aún no tienes cuenta)

---

## Paso 2 — Poner las credenciales en `.env`

Copia `.env.example` a `.env` y rellena los valores del paso anterior.
`.env` está en `.gitignore`: nunca se sube.

---

## Paso 3 — Subir el audio a Cloudinary

```bash
node scripts/upload-audio-to-cdn.mjs
```

Sube los 115 archivos (~690 MB) y guarda `scripts/cdn-manifest.json`.
Es idempotente: si se corta, vuelve a ejecutarlo y sigue donde quedó.

Después regenera el catálogo para que apunte al CDN:

```bash
node scripts/import-music.mjs
```

Verifica que ya no queden rutas locales:

```bash
grep -c '"url": "/music/' src/lib/data/imported.generated.ts   # debe dar 0
```

---

## Paso 4 — Aplicar las migraciones en Turso

```bash
npx prisma migrate deploy
```

Crea las tablas de usuarios, sesiones, canciones subidas y "me gusta".

---

## Paso 5 — Subir a GitHub

```bash
git init
git add -A
git commit -m "Shinoteca: archivo musical comunitario"
git branch -M main
git remote add origin git@github.com:TU-USUARIO/shinoteca.git
git push -u origin main
```

> Si `git push` da `Permission denied (publickey)`, necesitas una llave SSH:
> ```bash
> ssh-keygen -t ed25519 -C "tu@correo.com"
> cat ~/.ssh/id_ed25519.pub
> ```
> Pega esa clave pública en GitHub → Settings → SSH and GPG keys → New SSH key.

---

## Paso 6 — Importar en Vercel

1. https://vercel.com/new → importa el repositorio.
2. Framework: **Next.js** (se detecta solo). No cambies build ni output.
3. En **Environment Variables** añade las mismas cinco de tu `.env`:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

   `DATABASE_URL` **no** hace falta en Vercel (solo se usa en local).
4. Deploy.

---

## Paso 7 — Crear tu cuenta de administrador

Entra a `/login` en el sitio ya desplegado y regístrate.
**La primera cuenta que se registre se convierte en administradora
automáticamente**; las siguientes son usuarios normales.

---

## Añadir música más adelante

```bash
# 1. copia la carpeta del álbum dentro de /musica
node scripts/import-music.mjs        # detecta y limpia títulos
node scripts/upload-audio-to-cdn.mjs # sube lo nuevo al CDN
node scripts/import-music.mjs        # reapunta al CDN
git add -A && git commit -m "Nuevo álbum" && git push
```

Vercel redespliega solo al hacer push.

---

## Notas de consumo (planes gratuitos)

- **Cloudinary**: 25 créditos/mes. El catálogo ocupa ~0,7 en almacenamiento;
  quedan ~24 GB/mes de reproducción. Si se agota, la música deja de sonar
  hasta el mes siguiente — es el límite a vigilar.
- **Vercel**: 100 GB/mes de tráfico. Como el audio va por Cloudinary, aquí
  solo cuentan HTML/CSS/JS: muy difícil de agotar.
- **Turso**: 9 GB. Solo guarda texto (cuentas, "me gusta", metadatos).
