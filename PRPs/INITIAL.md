# 🖋️ Resumen — INITIAL.md (Plan General del MVP de Vagar Vacaciones)

## 🌟 Propósito
Este documento define el plan maestro para construir el **MVP (Producto Mínimo Viable)** de la plataforma **Vagar Vacaciones**, centrado en digitalizar la experiencia de descubrimiento y consulta de propiedades turísticas de lujo.

El objetivo es crear una interfaz moderna, inspirada en Airbnb, que permita explorar propiedades y experiencias, contactar para reservar, y gestionar consultas desde un panel administrativo.

---

## 🔧 Objetivos y Valor
- **Negocio:** Transformar digitalmente la marca, mejorar eficiencia y escalabilidad.  
- **Usuario:** Ofrecer una experiencia fluida, confiable y visualmente atractiva.  
- **Problemas que resuelve:** Procesos manuales, falta de disponibilidad en tiempo real, y presencia digital limitada.

---

## 🔍 Alcance del MVP
- Plataforma web responsive desarrollada con **Next.js, TypeScript, Tailwind CSS y shadcn/ui.**
- Catálogo de propiedades y experiencias filtrables.  
- Mapa interactivo con marcadores de propiedades.  
- Botón de contacto por **WhatsApp** o formulario para reservas.  
- Panel de administración para gestionar consultas y disponibilidad.

### Criterios de Éxito
- El usuario puede contactar exitosamente por WhatsApp para una propiedad.  
- El equipo de Vagar recibe y gestiona consultas en el panel interno.  
- La disponibilidad se actualiza manualmente mediante un archivo Excel.  
- El sitio es completamente responsive y coherente con el diseño UI/UX.

---

## 📁 Estructura del Proyecto
```
app/
 ├─ chalets/           → Listado y detalle de propiedades
 ├─ mapa/              → Mapa interactivo
 ├─ nosotros/, contacto/
 ├─ (admin)/           → Panel de administración
 │   ├─ dashboard/     → Métricas y consultas recientes
 │   ├─ consultas/     → Gestión de reservas
 │   └─ disponibilidad/→ Subida de archivo Excel
components/
 ├─ ui/                → Componentes base de shadcn
 └─ custom/            → PropertyCard, Header, Footer, etc.
lib/
 ├─ utils.ts, types.ts, data.ts, db.ts
```

---

## 🚀 Plan de Implementación (Blueprint)

### Fase 1: Setup del Proyecto
- Crear proyecto Next.js con TypeScript y Tailwind CSS.  
- Integrar shadcn/ui y configurar tema según la guía de estilo.

### Fase 2: Layout y Componentes
- Crear `Header`, `Footer` y layout principal.  
- Integrar diseño de tipografía centralizado (`components/ui/typography.tsx`).

### Fase 3: Homepage
- Hero banner con barra de búsqueda.  
- Secciones de propiedades destacadas y categorías.

### Fase 4: Propiedades
- Crear `PropertyCard.tsx`.  
- Implementar listado (`/chalets`) con filtros.  
- Detalle de propiedad (`/chalets/[id]`) con galería, servicios y calendario.

### Fase 5: Contacto y Reserva
- Panel de reserva en detalle de propiedad.  
- Botón “Contactar para Reservar” que abre WhatsApp con mensaje prellenado.

### Fase 6: Mapa Interactivo
- Crear `/mapa/page.tsx`.  
- Implementar mapa SVG con marcadores y popups.

### Fase 7: Páginas Estáticas
- Crear `/nosotros` y `/contacto`.

### Fase 8: Panel de Administración (CMS)
- Layout con sidebar (basado en `dashboard-01`).  
- Dashboard con métricas.  
- Tabla de consultas con filtros y acciones.  
- Subida de archivo Excel para disponibilidad.

---

## 🔒 Consideraciones y Buenas Prácticas
- No incluir reservas o pagos en línea.  
- Actualización de disponibilidad solo manual.  
- Evitar patrones nuevos cuando `shadcn` los provea.  
- No hardcodear textos o configuraciones que provengan del CMS.  
- Validar formularios y manejar estados de carga y error.

---

## ✅ Resultado Esperado
Un MVP funcional, escalable y visualmente coherente que siente las bases del ecosistema digital de **Vagar Vacaciones**, integrando:
- Frontend elegante e intuitivo.  
- Backend con base de datos supabase.  
- Panel administrativo para gestión interna.
