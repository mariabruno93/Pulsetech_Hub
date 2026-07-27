# Pulse Tech Hub — Documentación del proyecto

Sitio corporativo de **Pulse Tech Hub**, distribuidora B2B de hardware
enterprise desde Miami hacia el mundo (Dell, Lenovo, HP, Acer, Corsair,
etc.). Público objetivo: grandes compradores de tecnología, no consumidor
final.

Última revisión: 25 abr 2026.

---

## 1. URLs y hosting

| | |
|---|---|
| **Sitio en producción** | https://pulsetechub.com |
| **Alias con www** | https://www.pulsetechub.com *(redirige al principal)* |
| **Preview Vercel** | https://pulsetech-hub-rho.vercel.app |
| **Repositorio** | https://github.com/mariabruno93/Pulsetech_Hub |
| **Branch activa** | `claude/create-pulse-tech-hub-MGjMn` |

**Deploy**: cada push a esa branch dispara un rebuild automático en
Vercel. No hay pipeline manual.

---

## 2. Servicios externos y credenciales

| Servicio | Uso | Configuración |
|---|---|---|
| **Vercel** | Hosting + SSL + CDN | Cuenta Hobby free; proyecto `pulsetech-hub` |
| **Namecheap** | Dominio | `pulsetechub.com` con DNS records: A `@` → `216.198.79.1` y CNAME `www` → `cname.vercel-dns.com` |
| **FormSubmit** | Envío del formulario Access | Endpoint público `https://formsubmit.co/ajax/pulsetechhubllc@gmail.com` — sin cuenta |
| **Simple Icons CDN** | Logos de partners | URLs públicas del tipo `https://cdn.simpleicons.org/{brand}/c6ccd4` |
| **WhatsApp** | Botón flotante de contacto | Link `https://wa.me/13022738993` |

**FormSubmit activación**: la primera vez que alguien envía el formulario,
FormSubmit manda un mail de activación a `pulsetechhubllc@gmail.com`.
**Hay que clickear el link una sola vez** para habilitar los envíos.

---

## 3. Datos de contacto (visibles en el sitio)

- **Email**: `pulsetechhubllc@gmail.com`
- **Teléfono**: `+1 (302) 273-8993`
- **WhatsApp**: mismo número (botón verde flotante en todas las páginas)
- **Dirección**: 1450 Brickell Ave, Suite 1900, Miami, FL 33131

---

## 4. Estructura del código

```
Pulsetech_Hub/
├── index.html          Landing principal (7 secciones + nav + footer)
├── login.html          Página de login (siempre rechaza credenciales)
├── styles.css          Todo el CSS del sitio
├── main.js             Interactividad (nav, form, video, etc.)
├── robot.mp4           Video del robot en el hero (~300 KB)
├── robot.png           Poster/fallback del video
├── favicon.svg         Icono principal (escalable)
├── favicon-32.png      Fallback para tab
├── favicon-192.png     Icono para home screen iOS
├── heart.png           Legacy — versión anterior con corazón
├── hands.png           Legacy — versión anterior con manos v1
├── hands2.png          Legacy — versión anterior con manos v2
├── logo.svg            Logo SVG original (no en uso actual)
└── README.md           Este archivo
```

**Legacy assets**: se dejaron en el repo por si algún día se quiere
volver a alguna versión anterior. No están referenciados en el HTML.

---

## 5. Secciones de `index.html`

1. **Nav** fijo — About · Capabilities · Partners + Login + Request Access
2. **Hero** — kicker, headline, subtítulo, dos CTAs, video del robot
3. **Manifesto (About)** — quiénes servimos, diferenciales
4. **Capabilities** — 4 disciplinas en grid 2×2
5. **Partners** — 10 marcas en grid 5×2
6. **Access** — formulario de solicitud de acceso
7. **Footer** — brand + contacto (email/tel/dirección) + links + copyright

`login.html` reusa nav, footer y estilos; solo su `<main>` es distinto.

---

## 6. Sistema de diseño

### Paleta (variables CSS en `:root`)

| Variable | Hex | Uso |
|---|---|---|
| `--navy` | `#0A1628` | Fondo principal |
| `--navy-deep` | `#050C18` | Secciones alternas y footer |
| `--navy-card` | `#0E1A30` | Cards, login-card |
| `--silver` | `#C6CCD4` | Acento primario, brand dot |
| `--titanium` | `#9DA5B1` | Acento alternativo |
| `--ice` | `#F4F5F7` | Headings, texto crítico |
| `--gray` | `#9AA1AD` | Cuerpo de texto |
| `--gray-dim` | `#5D6474` | Meta, copyright |

**Regla**: cero rojo. Cero amarillo. Cero naranja. Todo se mantiene en
navy + silver/plata + blanco hielo.

### Tipografía

- **Inter** (weights 200–500): todo el texto principal. Los títulos
  usan 200 (ExtraLight) — el peso ligero es lo que da el look premium
  minimalista corporativo. **No usar Bold (700+).**
- **IBM Plex Mono** (weights 300–400): eyebrows, labels de formulario,
  copyright, datos técnicos flotantes.

Ambas se cargan desde Google Fonts.

### Elementos característicos

- **Brand dot**: círculo silver de 7px (5px en footer) que **late al
  ritmo cardíaco de 60 BPM** (lub-dub). Presente en nav y footer.
- **Pulse line**: línea silver de 1px al pie del hero y del footer,
  con un highlight que barre horizontalmente cada 14–18s.
- **Favicon**: `· P` (dot silver + letra P) sobre navy con esquinas
  redondeadas. Generado en 3 tamaños.

---

## 7. Comportamiento del hero (destacado)

### Video del robot
- Se reproduce **una sola vez** al cargar la página.
- Al terminar queda **congelado en el último frame** (sin loop).
- Si el visitante scrollea fuera del hero y vuelve, el video se
  rebobina y se reproduce una vez más. Un IntersectionObserver en
  `main.js` maneja esta lógica.
- Usa `mix-blend-mode: screen` con un backdrop navy explícito en
  `.hero-visual` para que el fondo negro del mp4 se fusione con la
  página (sin rectángulo visible).
- Una máscara radial (`ellipse 58% 62%`) tapa los artefactos de
  compresión H.264 en los bordes.

### Robot pensante
- Video 540×668 (portrait) recortado del original 1366×768 landscape
  que dio Leonardo.ai.
- Empieza en pose de pensar → mira a cámara → vuelve a pose de pensar.

---

## 8. Formulario Access

Envía las submissions a `pulsetechhubllc@gmail.com` vía FormSubmit
(sin backend propio).

- **Método**: POST AJAX a `formsubmit.co/ajax/pulsetechhubllc@gmail.com`
- **Fallback**: si JS falla, el `<form>` postea al endpoint estándar
  y redirige a la thank-you page de FormSubmit.
- **Campos**: Company · Full name · Corporate email · Country ·
  Anticipated volume / use case.
- **Hidden inputs**: `_subject`, `_template=table`, `_captcha=false`,
  `_honey` (honeypot anti-spam).
- **UX**: botón muestra "Sending…" → "Request received" → vuelve a
  su estado inicial después de 3s. Si falla, muestra "Please try
  again".

---

## 9. Login (`login.html`)

**No hay backend real.** El formulario está por UX/apariencia:

- Cualquier email + password válidos activan un mensaje que dice:
  > **ACCOUNT NOT FOUND**
  > This account is not registered.
  > *(...) Access is granted only to qualified partners.*
- Debajo aparece un botón **Request Access** que linkea a
  `index.html#access`.

Si en el futuro querés habilitar login real, hay que armar un
backend (Vercel Functions + base de datos o Supabase/Auth0).

---

## 10. Copy clave (para editar rápido)

| Elemento | Texto actual | Ubicación |
|---|---|---|
| Kicker | `MIAMI · GLOBAL HARDWARE PROCUREMENT` | `index.html` §Hero |
| Headline | *The hardware behind the world we know.* | `index.html` §Hero |
| Subtitle | *Priority procurement, inventory access, and advisory for qualified partners.* | `index.html` §Hero |
| Manifesto | *Pulse Tech Hub supplies enterprise-grade hardware to qualified buyers worldwide. Every unit is sourced direct from the manufacturer. Every order is staged at our Miami operations center. Every quote is built around your deployment, not our catalog.* | `index.html` §Manifesto |
| Capabilities | Procurement · Inventory Access · Advisory · Bulk Fulfillment | `index.html` §Capabilities |
| Access lead | *Inventory and pricing are disclosed to qualified partners.* | `index.html` §Access |
| Footer tagline | *Enterprise hardware. Worldwide.* | `index.html` §Footer |

Todo el sitio está **en inglés**. El código y comentarios de dev
también en inglés.

---

## 11. Cambios comunes — cómo hacerlos

### Cambiar copy (título, párrafos, botones)
Editar directo en `index.html` o `login.html`. Commit, push, deploy.

### Cambiar email de contacto
Reemplazar todas las apariciones de `pulsetechhubllc@gmail.com` en:
- `index.html` (footer + form action + form ajax endpoint)
- `login.html` (footer)
- `main.js` (constante `ENDPOINT` dentro de `initAccessForm`)

### Cambiar teléfono / WhatsApp
Actualizar en cuatro lugares:
- `index.html`: tel link en footer + wa.me link en botón flotante
- `login.html`: mismo par

### Cambiar colores de marca
Sólo tocar las variables `--navy`, `--silver`, `--ice`, etc. en el
bloque `:root` al inicio de `styles.css`. Todo el resto del CSS las
consume.

### Agregar/quitar partner
En `index.html`, sección `<div class="partners-grid">`. Cada marca
es un bloque:
```html
<span class="partner-mark">
  <img class="partner-logo" src="https://cdn.simpleicons.org/BRAND/c6ccd4"
       alt="BRAND"
       onerror="this.parentElement.classList.add('logo-fallback')" />
  <span class="partner-name">BRAND</span>
</span>
```
Reemplazar `BRAND` por el slug de Simple Icons y el nombre real.

### Cambiar el video del robot
1. Poner el nuevo mp4 en el repo como `robot.mp4`.
2. Si cambia el aspect ratio, ajustar `aspect-ratio` en `.hero-visual`
   dentro de `styles.css` (buscar `aspect-ratio: 540 / 668;`).

---

## 12. Flujo de trabajo

1. Clonar el repo o trabajar directo desde GitHub web.
2. Hacer cambios en la branch **`claude/create-pulse-tech-hub-MGjMn`**.
3. Commit + push.
4. Vercel detecta el push y auto-deploya en ~30–60 segundos.
5. Verificar en `pulsetechub.com` (hard-refresh con Ctrl+Shift+R
   para evitar caché).

---

## 13. Costos operativos

| Concepto | Costo aprox. |
|---|---|
| Dominio (Namecheap) | USD 7–14 / año |
| Hosting Vercel Hobby | USD 0 |
| FormSubmit | USD 0 |
| Simple Icons CDN | USD 0 |
| **Total anual** | **~USD 10** |

Todo lo demás (SSL, CDN, redeploys, tráfico razonable) está incluido
en los planes gratuitos.

---

## 14. Notas técnicas para futuros cambios

- **Cache**: el navegador cachea agresivamente `styles.css`, `main.js`
  y sobre todo los favicons. Después de un deploy, siempre probar
  con `Ctrl+Shift+R` o modo incógnito.
- **mix-blend-mode + video**: si algún día se cambia la estructura
  del hero, el `mix-blend-mode: screen` del video **requiere** que
  el contenedor `.hero-visual` tenga `background: var(--navy)` y
  `isolation: isolate`. Sin eso, el rectángulo negro del mp4 vuelve
  a aparecer.
- **Prefers-reduced-motion**: todas las animaciones se desactivan
  automáticamente si el visitante tiene "reducir movimiento"
  activado en su OS. La regla global está en `styles.css`.
- **Partner logos**: Solarmax y KTC no están en Simple Icons y caen
  al wordmark en texto. Si en algún momento se quiere que también
  sean logos gráficos, hay que descargar el SVG oficial y hostearlo
  local en el repo (por ej. `logos/solarmax.svg`).

---

## 15. Historial (highlights)

El sitio pasó por varias iteraciones importantes:

1. **Concepto inicial** (rojo/negro, corazón latiendo) — descartado
   por lucir demasiado gaming.
2. **Manos robot buscándose** — descartado por artístico.
3. **Rebranding corporativo** — paleta navy/silver, sin rojo,
   tipografía light, cero decoración innecesaria.
4. **Video del robot** — reemplazó al robot como imagen fija, con
   comportamiento play-once + freeze.
5. **Correcciones finales** — halo eliminado, robot al centro,
   scan line eliminada.

---

## 16. Retomar el proyecto en el futuro

Si más adelante querés hacer cambios y estás trabajando con otra
IA o desarrollador:

1. Compartí este README como primer input — resume todo el contexto.
2. La branch de trabajo es `claude/create-pulse-tech-hub-MGjMn`.
3. Los cambios se propagan a producción vía Vercel automáticamente.
4. Mantené las restricciones de marca: **cero rojo**, **fine typography**,
   **whitespace generoso**, **cero elementos gaming/artísticos**.

---

*Última contribución: iteraciones finales del hero (video + heartbeat
en el dot + limpieza del halo). Proyecto en estado estable, listo
para producción.*
