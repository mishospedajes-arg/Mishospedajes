name: "PRP - Vagar Vacaciones MVP v1"
description: |

## Purpose
Este PRP está optimizado para que un agente de IA implemente el MVP de la plataforma web de Vagar Vacaciones, proporcionando todo el contexto necesario y bucles de validación para lograr un código funcional a través de un refinamiento iterativo.

## Core Principles
1. **Context is King**: Incluir TODA la documentación, ejemplos y advertencias necesarias.
2. **Validation Loops**: Proporcionar pruebas/linters ejecutables que la IA pueda correr y corregir.
3. **Information Dense**: Usar palabras clave y patrones del codebase.
4. **Progressive Success**: Empezar simple, validar y luego mejorar.
5. **Global rules**: Asegurarse de seguir todas las reglas en CLAUDE.md.

---

## Goal
Construir la plataforma web MVP (Producto Mínimo Viable) para "Vagar Vacaciones". El objetivo es digitalizar la experiencia de descubrimiento y consulta de propiedades, creando una interfaz moderna, elegante y confiable inspirada en el estándar de Airbnb. El MVP se centrará en exhibir propiedades de alta calidad, facilitar la búsqueda a través de filtros y un mapa interactivo, y canalizar las consultas de reserva a un panel de gestión interno para el equipo de Vagar.

## Why
- **Valor de Negocio:** Liderar la transformación digital de una marca establecida, permitiendo la escalabilidad del negocio sin comprometer la calidad del servicio de alto contacto.
- **Impacto en el Usuario:** Ofrecer a los viajeros de lujo una experiencia digital fluida y confiable para descubrir propiedades, y sentar las bases para un futuro portal de autoservicio para propietarios.
- **Problemas que Resuelve:** Supera las limitaciones de los procesos manuales actuales, mejora la eficiencia operativa y moderniza la presencia de la marca para cumplir con las expectativas de los clientes actuales.

## What
Una plataforma web responsive construida con Next.js y shadcn, que muestra propiedades de lujo desde un CMS propio. Los usuarios pueden buscar, filtrar y ver propiedades en un mapa. El flujo de reserva es manual, iniciado por un botón "Contactar para Reservar" que notifica al equipo de Vagar a través de WhatsApp/formulario.

### Success Criteria
- [ ] Un viajero puede encontrar y consultar exitosamente sobre una propiedad a través de un mensaje de WhatsApp pre-llenado.
- [ ] El equipo de Vagar recibe la consulta en un panel de administración interno.
- [ ] El equipo de Vagar puede actualizar la disponibilidad de las propiedades subiendo un archivo Excel.
- [ ] La plataforma es completamente responsive y sigue las directrices de diseño especificadas.

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir estos en tu ventana de contexto
- file: examples/front-end-spec.md
  why: Especificación detallada de UI/UX, flujos de usuario, componentes y guía de estilo.
  
- file: examples/brief
  why: Visión de negocio, propuesta de valor y objetivos estratégicos.

- file: examples/prd
  why: Requisitos funcionales y no funcionales, alcance del MVP y stack tecnológico.

- doc: https://ui.shadcn.com/
  why: Documentación oficial de la librería de componentes de UI a utilizar.

- doc: https://nextjs.org/docs
  why: Documentación oficial del framework de frontend.
```

### Current Codebase tree
```bash
# Este es un proyecto nuevo (greenfield). La estructura de archivos se creará desde cero.
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
.
├── app/
│   ├── (pages)/
│   │   ├── chalets/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Página de detalle de propiedad
│   │   │   └── page.tsx          # Página de listado de propiedades
│   │   ├── mapa/
│   │   │   └── page.tsx          # Página del mapa interactivo
│   │   ├── nosotros/
│   │   │   └── page.tsx          # Página "Sobre Nosotros"
│   │   ├── contacto/
│   │   │   └── page.tsx          # Página de contacto
│   │   └── page.tsx              # Homepage
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard principal del administrador
│   │   ├── consultas/
│   │   │   └── page.tsx          # Página para gestionar consultas
│   │   ├── disponibilidad/
│   │   │   └── page.tsx          # Página para subir Excel de disponibilidad
│   │   └── layout.tsx            # Layout específico para el panel de admin
│   ├── layout.tsx                # Layout principal
│   └── globals.css               # Estilos globales
├── components/
│   ├── ui/                       # Componentes de shadcn
│   ├── custom/
│   │   ├── PropertyCard.tsx      # Tarjeta para mostrar una propiedad
│   │   ├── Header.tsx            # Navegación principal
│   │   └── Footer.tsx            # Pie de página
├── lib/
│   ├── utils.ts                  # Funciones de utilidad
│   └── types.ts                  # Definiciones de tipos de TypeScript
├── public/
│   └── ...                       # Assets estáticos (imágenes, fuentes)
└── ...                           # Archivos de configuración (next.config.js, tailwind.config.ts, etc.)
```

### Known Gotchas of our codebase & Library Quirks
```
# CRITICAL: El MVP no incluye reservas o pagos en línea. 
# CRITICAL: La actualización de disponibilidad es un proceso manual a través de la subida de un archivo Excel en el backend.
# CRITICAL: El portal para propietarios está fuera del alcance del MVP.
# Tech Stack: Next.js (App Router), TypeScript, Tailwind CSS, shadcn.

# GOOD PRACTICE: Se ha implementado un sistema de tipografía centralizado en `components/ui/typography.tsx`.
# Para asegurar la consistencia visual, todos los elementos de texto (encabezados, párrafos, etc.)
# deben usar estos componentes reutilizables (ej. <H1>, <P>, <Lead>) en lugar de etiquetas HTML nativas (<h1>, <p>).
# Esto permite que los estilos de texto se gestionen desde un único lugar, siguiendo las directrices de Shadcn.
```

## Implementation Blueprint

### list of tasks to be completed to fullfill the PRP in the order they should be completed
```yaml
Task 1: Setup del Proyecto
  - CREATE un nuevo proyecto Next.js con TypeScript y Tailwind CSS.
  - INTEGRATE shadcn en el proyecto.
  - CONFIGURE el tema de Tailwind (colores, tipografía) según `front-end-spec.md`.

Task 2: Layout Principal y Componentes
  - CREATE el componente `Header.tsx` con la navegación principal.
  - CREATE el componente `Footer.tsx`.
  - INTEGRATE `Header` y `Footer` en el `app/layout.tsx` principal.

Task 3: Construcción de la Homepage
  - CREATE `app/page.tsx`.
  - IMPLEMENT el hero banner y la barra de búsqueda principal.
  - IMPLEMENT las secciones de categorías curadas y propiedades destacadas.

Task 4: Flujo de Listado y Detalle de Propiedades
  - CREATE el componente `PropertyCard.tsx`.
  - CREATE la página de listado de propiedades `app/chalets/page.tsx` con filtros y ordenamiento.
  - CREATE la página de detalle de propiedad `app/chalets/[id]/page.tsx` mostrando galería de imágenes, descripción, servicios y calendario de disponibilidad.

Task 5: Flujo de Contacto para Reservar
  - IMPLEMENT el panel de reserva/consulta fijo en la página de detalle.
  - INTEGRATE el botón "Contactar para Reservar" para abrir WhatsApp con un mensaje pre-llenado.

Task 6: Mapa Interactivo
  - CREATE la página `app/mapa/page.tsx`.
  - INTEGRATE una librería de mapas (como `react-zoom-pan-pinch` sobre una imagen SVG/mapa estilizado).
  - IMPLEMENT los marcadores de propiedades y las tarjetas de detalle emergentes.

Task 7: Páginas Estáticas
  - CREATE las páginas `app/nosotros/page.tsx` y `app/contacto/page.tsx` con contenido estático.

Task 8: Panel de Administración (CMS)
  - CREATE la estructura de rutas y layout para el área de administración (`/app/(admin)`).
  - IMPLEMENT el dashboard principal con métricas clave.
  - IMPLEMENT la tabla de gestión de consultas de reserva.
  - IMPLEMENT la funcionalidad de subida de archivos Excel para actualizar la disponibilidad.
```

## Validation Loop


## Anti-Patterns to Avoid
- ❌ No crear nuevos patrones de diseño cuando los de shadcn son suficientes.
- ❌ No saltarse la validación de formularios.
- ❌ No ignorar los estados de carga y error en las interacciones de datos.
- ❌ No hardcodear texto o configuraciones que deberían venir del CMS.

---
## Confidence Score
**9/10** - El PRP es extremadamente detallado, basado en una investigación exhaustiva de los documentos proporcionados (`brief`, `prd`, `front-end-spec.md`). El alcance del MVP está claramente definido, el stack tecnológico es estándar y los pasos de implementación son lógicos y secuenciales. La probabilidad de éxito en una sola pasada es alta.
