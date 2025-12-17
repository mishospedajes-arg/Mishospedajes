## FEATURE:

"Generá un proyecto web en Next.js con TypeScript y React, que muestre un mapa interactivo tipo plano (SVG) con estas características:

Estructura principal
Usa Next.js con un componente InteractiveMap.

Integra react-zoom-pan-pinch (TransformWrapper / TransformComponent) para zoom, pan y gestos táctiles.

Dentro del wrapper, renderiza un <svg> conteniendo:

Un <image href="fondo.png" … /> con el plano exportado (PNG/JPG).

Un <defs> con filtros SVG (ej. feDropShadow, feColorMatrix).

Varios <path> o <g> para zonas con IDs claros (e.g. Zone_A1, Zone_B2).

Pines (<circle> o <image>) posicionados según coordenadas en JSON.

Animaciones e interacciones con Framer Motion
Usa componentes de Framer Motion (motion.path, motion.circle, motion.div) para animar:

whileHover en zonas para destacar (scale, fill, filtro).

whileTap o onClick para abrir tarjetas animadas con efecto “scale in” o “fade in”.

initial / animate / exit para transiciones de tarjetas/modal.

Aplica animaciones a pines (whileHover, whileTap) y rutas/filtros con motion.feGaussianBlur o feColorMatrix 
youtube.com
+15
motion.dev
+15
syncfusion.com
+15
reactlibs.dev
youtube.com
+3
refine.dev
+3
syncfusion.com
+3
themexpert.com
.

Comportamiento táctil y zoom
Configura TransformWrapper con:

js
Copy
Edit
initialScale={1}
minScale={0.5}
maxScale={4}
doubleClick={{ disabled: true }}
pinch={{ disabled: false }}
Usa react-zoom-pan-pinch version estable para gestos móviles confiables 
npmjs.com
blog.nashtechglobal.com
.

Detectar si el contenido está zoomed-in usando onZoomStart / onZoomEnd para evitar bloquear el scroll de página.

Datos iniciales
Crear un JSON de zonas: { id, label, info, pinCoords: { x,y } }.

Generar componentes dinámicos:

Pines: <motion.circle> para cada zona en coordenadas relativas.

Tarjetas: <motion.div> o modal que aparece cuando el usuario hace click.

SVG preparado
Exportar en Illustrator:

Zonas en capas con nombres claros.

Sin embed de imagen, solo vectores con IDs.

Fondo exportado como PNG/JPG.

SVG limpiado y convertido con SVGR para React.

Incluir <defs><filter id="highlight">...</filter></defs> para efectos visuales.

Estilos y componentes
CSS modules o styled-components para estilos reactivos.

.plano-svg { width:100%; height:auto; }

.tooltip-card con animación initial={{ opacity: 0, y: 10 }} animate={{ opacity:1, y:0 }}.

Pines con whileHover={{ scale: 1.2 }}, whileTap={{ scale: 0.9 }}.

Accesibilidad y responsividad
Asegurar componentes con aria-label, etiquetas semánticas, alto contraste.

Tarjetas accesibles vía teclado (tabindex, onKeyEnter).

Extras 
Agregar useScroll, whileInView para animar elementos al ingresar al viewport 
themexpert.com
.

transiciones suaves con layout en pines o tarjetas animadas en posición dinámica.

## EXAMPLES:

[Provide and explain examples that you have in the `examples/` folder]

## DOCUMENTATION:

[List out any documentation (web pages, sources for an MCP server like Crawl4AI RAG, etc.) that will need to be referenced during development]

## OTHER CONSIDERATIONS:

[Any other considerations or specific requirements - great place to include gotchas that you see AI coding assistants miss with your projects a lot]
