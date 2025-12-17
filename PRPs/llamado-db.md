# 📘 Guía Definitiva para Llamadas a la Base de Datos en Vagar Vacaciones

## Propósito
Este documento es la guía técnica y el manual de buenas prácticas para crear, gestionar y depurar llamadas a la base de datos MySQL en Vagar Vacaciones. El objetivo es mantener un código limpio, eficiente, y a prueba de errores comunes.

---

## 1. Arquitectura de Conexión: `lib/db.ts`

La conexión a la base de datos se centraliza en `lib/db.ts` mediante un **pool de conexiones** (`mysql.createPool`). Esto es fundamental para el rendimiento, ya que Next.js reutiliza conexiones existentes.

**Regla de Oro:** Nunca instancies una conexión directa. Importa y utiliza siempre el `pool` desde `lib/db.ts`.

---

## 2. Capa de Abstracción de Datos: `lib/data.ts`

Este archivo es el único lugar donde deben existir consultas SQL. Actúa como una **capa de abstracción** que desacopla el frontend de la lógica de la base de datos.

**Regla de Oro:** Si necesitas un nuevo dato, crea una función `fetch` en `lib/data.ts`. Los componentes de servidor solo deben llamar a estas funciones.

---

## 3. Guía para una Nueva Consulta (Ej: Experiencias Destacadas)

1.  **Definir el Tipo (`lib/types.ts`):** Asegúrate de que el tipo de datos que esperas esté definido.
    ```typescript
    export type Experience = { id: number; title: string; /*...*/ };
    ```

2.  **Crear la Función Fetch (`lib/data.ts`):** Añade una función `async` que ejecute la consulta.
    ```typescript
    import { pool } from './db';
    import { Experience } from './types';

    export async function fetchFeaturedExperiences(): Promise<Experience[]> {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(`
          SELECT * FROM Experiences WHERE featured = true LIMIT 4
        `);
        return rows as Experience[];
      } catch (error) {
        console.error('Error fetching featured experiences:', error);
        return []; // Devuelve un array vacío en caso de error
      } finally {
        connection.release(); // ¡Crucial! Libera la conexión.
      }
    }
    ```

3.  **Llamar desde un Componente de Servidor:**
    ```typescript
    // app/page.tsx
    import { fetchFeaturedExperiences } from '@/lib/data';

    export default async function HomePage() {
      const featuredExperiences = await fetchFeaturedExperiences();
      // ... renderiza los datos
    }
    ```

---

## 4. Manejo de Relaciones y Datos Complejos

### La Solución Definitiva: `JSON_ARRAYAGG`

Para evitar el problema de "N+1 queries", usamos subconsultas con `JSON_ARRAYAGG` para agrupar datos relacionados (como imágenes o amenities) en un solo array JSON.

**Lección Clave de la Sesión (Imágenes):**
Cuando una entidad tiene múltiples tipos de imágenes (ej: `gallery` y `blueprint`), crea una subconsulta para cada categoría.

```sql
-- Ejemplo en fetchPropertyById()
SELECT
  p.*,
  -- Subconsulta para imágenes de galería
  COALESCE((
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'url', i.url))
    FROM Images i
    WHERE i.entity_id = p.id AND i.image_category = 'gallery'
  ), '[]') as gallery_images,
  -- Subconsulta para planos
  COALESCE((
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', i.id, 'url', i.url))
    FROM Images i
    WHERE i.entity_id = p.id AND i.image_category = 'blueprint'
  ), '[]') as blueprint_images
FROM Properties p
WHERE p.id = ?;
```

### Simplificando el Frontend: El Campo Derivado

**Lección Clave de la Sesión (Imagen Principal):**
Para simplificar la lógica en los componentes del frontend (como `PropertyCard`), es una excelente práctica preparar los datos en el backend. En lugar de pasar un array de imágenes y que el frontend tenga que encontrar la primera, crea un campo derivado directamente en la consulta SQL.

```sql
-- Añadiendo main_image_url a la consulta
SELECT
  p.*,
  (
    SELECT i.url FROM Images i
    WHERE i.entity_id = p.id AND i.image_category = 'gallery'
    ORDER BY i.id -- O el campo 'order' si existe
    LIMIT 1
  ) as main_image_url,
  -- ... resto de subconsultas
FROM Properties p;
```
Luego, añade `main_image_url?: string;` al tipo `Property` en `lib/types.ts`. El componente del frontend ahora solo necesita consumir este campo, simplificando enormemente su código.

---

## 5. Sincronización y Depuración de la Base de Datos

### `init.sql` y `seed.js`
- **`init.sql`** es la única fuente de verdad para la **estructura** de la base de datos.
- **`scripts/seed.js`** es para poblar la base de datos con **datos de prueba**.
- **Flujo de trabajo:** Modifica `init.sql` -> Modifica el seeder si es necesario -> Ejecuta `pnpm db:seed`.

### ¡Mi Base de Datos no se Actualiza! (Solución al Problema de Docker)

**Lección Clave de la Sesión (Debugging de Docker):**
Si has modificado `init.sql` pero la aplicación sigue lanzando errores como `Unknown column`, es muy probable que el volumen de Docker esté usando una versión antigua de la base de datos.

**Solución Forzada (Reconstrucción Completa):**
Ejecuta estos comandos en la raíz del proyecto para forzar a Docker a eliminar la base de datos antigua y reconstruirla desde cero con los cambios de `init.sql`:

1.  **Detener y eliminar contenedores y volúmenes:**
    ```bash
    docker-compose down -v
    ```
    *(La bandera `-v` es la clave, ya que elimina los volúmenes donde persisten los datos).*

2.  **Reconstruir e iniciar los servicios:**
    ```bash
    docker-compose up --build -d
    ```

3.  **Repoblar la base de datos:**
    ```bash
    pnpm db:seed
    ```

Este proceso de tres pasos resuelve el 99% de los problemas de desincronización entre el código y la base de datos local.
