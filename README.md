# Sitio personal — Alejandra Catherine Montaña Acevedo · DraCorazónIA

Sitio estático (HTML + CSS + un poco de JS, sin dependencias) publicado con GitHub Pages en
https://acatherinebusinessintelligence.github.io/

## Páginas

| Archivo | Contenido |
|---|---|
| `index.html` | Inicio: presentación, investigaciones destacadas, marcos propios y contacto |
| `investigacion.html` | Proyectos con filtros por línea, publicaciones con DOI, ponencias y semilleros |
| `proyectos.html` | Desarrollos de IA aplicada e impacto social |
| `docencia.html` | Laboratorios y simuladores abiertos, trayectoria docente y formación ejecutiva |
| `cv/` | Hoja de vida académica |

`style.css` contiene el sistema visual (paleta azul → rosa de DraCorazónIA, Space Grotesk + Manrope)
y `main.js` el menú móvil, los filtros y las animaciones de aparición.

## Editar

- **Foto:** `images/alejandra.jpg` y `images/alejandra.webp`.
- **Contacto:** solo correo (`analizamostunegocio@gmail.com`); no se publican teléfonos.
- **Nuevas investigaciones:** copia un `<article class="card">` en `investigacion.html`; el atributo
  `data-topics` (`etica`, `neuro`, `agro`, `civica`, `nlp`, `ml`) define en qué filtros aparece.

## Publicación

Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
