# 📘 Resumen — DB Story (Base de Datos y Backend de Vagar Vacaciones)

## Objetivo
Diseñar, implementar y conectar una **base de datos MySQL** con la aplicación **Next.js** del proyecto **Vagar Vacaciones**, garantizando integridad de datos, escalabilidad y compatibilidad con el hosting **WNPower**.

---

## Elección Tecnológica
- **Producción:** MySQL (servidor WNPower vía cPanel).  
- **Desarrollo local:** MySQL en Docker para mantener paridad con producción.  
- **Cliente de conexión:** `mysql2` gestionado desde `lib/db.ts`.

---

## Diseño de la Base de Datos

### Relaciones principales
```
[Properties] --< PropertyImages >-- [Images]
      |
      |--< PropertyAmenities >-- [Amenities]
      '--< PropertyRules >-- [Rules]

[Experiences] --< ExperienceImages >-- [Images]
```

### Tablas Clave

#### `Properties`
Contiene información principal de cada chalet:
- `id`, `name`, `description`, `location`, `category`
- `guests`, `bedrooms`, `beds`, `bathrooms`
- `rating`, `price_high`, `price_mid`, `price_low`
- `map_node_id` (para identificar en mapa SVG)
- `featured` (booleano, propiedad destacada)

#### `Experiences`
- `id`, `title`, `category`, `short_description`, `long_description`
- `what_to_know` (JSON con tips y puntos clave)

#### `Images`
Centraliza todas las imágenes de propiedades y experiencias:
- `url`, `alt_text`, `entity_type` (`property` o `experience`), `entity_id`, `order`

#### `Amenities`
Catálogo de servicios con íconos y categorías.

#### `PropertyAmenities`
Relación muchos a muchos entre propiedades y amenities.

#### `Bookings`
Consultas de reserva con:
- Datos del cliente
- Fechas de check-in/check-out
- Estado (`pending`, `confirmed`, `cancelled`)

---

## Plan de Implementación

1. **Entorno Local:**
   - `docker-compose.yml` define servicio MySQL.  
   - Variables de entorno (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`).  
   - Comando base: `docker-compose up -d`.

2. **Migraciones y Seeding:**
   - `init.sql`: crea estructura completa de tablas.
   - `scripts/seed.js`: importa datos desde `placeholder-data.ts` y `amenities-data.ts`.  
   - Comando: `pnpm db:seed`.

   > **Nota Importante:** Cada vez que se modifique la estructura en `init.sql` o los datos en los archivos `placeholder`, es crucial ejecutar `pnpm db:seed` para asegurar que la base de datos local esté actualizada. Este comando limpia las tablas y las vuelve a poblar desde cero.

3. **Conexión a la App:**
   - `lib/db.ts`: pool de conexión con `mysql2`.  
   - `lib/data.ts`: funciones `fetchProperties()`, `fetchExperiences()`, etc.  
   - Variables en `.env.local` para credenciales.

4. **Panel de Administración (UI):**
   - Layout basado en `dashboard-01` (shadcn).
   - Componentes clave:
     - `DataTable` → gestión de consultas.
     - `input-file` → subir Excel de disponibilidad.
     - `Card` → métricas del dashboard.

---

## Proceso de Despliegue en WNPower
1. Crear la base MySQL desde cPanel.  
2. Ejecutar `init.sql` y opcionalmente importar los datos del seeding.  
3. Configurar variables de entorno en producción.  
4. Verificar conexión desde Next.js y funcionamiento del panel de admin.

---

## Avances Destacados

- **Integración Next.js ↔ MySQL completa.**  
- **CRUD funcional para chalets y experiencias.**  
- **Gestión de imágenes con Vercel Blob.**  
- **Campo `featured` agregado para destacar propiedades.**  


---

## Estado Final
La base de datos está **totalmente implementada y sincronizada** con el frontend.  
El sistema soporta:
- Gestión completa desde panel de administración.  
- Visualización dinámica en el sitio público.  
- Flujo estable de consultas, imágenes y experiencias.
