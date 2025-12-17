# 🖋️ Solución al Desfase de Fechas en Calendarios y Búsquedas

## 🎯 Problema
Se detectó un desfase de un día en todos los componentes que manejan fechas, como el `AvailabilityCalendar` en la página de detalles del chalet y el `SearchBar` en la página principal. Si una fecha de no disponibilidad era, por ejemplo, el 10 de octubre, la interfaz la mostraba como el 9 de octubre.

Este error es crítico, ya que afecta directamente la capacidad del usuario para entender la disponibilidad real de una propiedad.

---

## 🔍 Causa Raíz: El Conflicto de Zonas Horarias (UTC vs. Local)

El problema se originaba por un manejo inconsistente de las zonas horarias a lo largo del flujo de datos:

1.  **Backend (Creación):** Las fechas se leían del archivo Excel y se convertían correctamente a objetos `Date` de JavaScript en formato **UTC**. Por ejemplo, `2025-10-10T00:00:00.000Z`.
2.  **Base de Datos (Almacenamiento/Lectura):** La conexión con la base de datos MySQL no estaba configurada para manejar fechas en UTC. Por defecto, el driver `mysql2` convertía la fecha UTC a la zona horaria del servidor de la base de datos al escribir, y viceversa al leer. Esto corrompía la fecha original.
3.  **Frontend (Visualización):** Incluso después de corregir la base de datos, persistía un problema. El frontend recibía la fecha UTC correcta (`2025-10-10T00:00:00.000Z`), pero al crear un objeto `new Date()` en el navegador, este lo interpreta y muestra en la **zona horaria local del usuario**. Para un usuario en Argentina (UTC-3), esa fecha es el `9 de octubre a las 21:00`, causando que el calendario muestre el día incorrecto.

---

## 🔧 Solución Implementada

La solución se aplicó en dos capas para asegurar la consistencia de principio a fin:

### 1. Forzar UTC en la Conexión de la Base de Datos

Se modificó el archivo `lib/db.ts` para forzar que todas las fechas (`DATETIME`/`DATE`) se traten como UTC. Esto elimina cualquier conversión inesperada en la capa de datos y asegura que lo que se guarda es lo que se lee.

**Código en `lib/db.ts`:**
```typescript
const pool = mysql.createPool({
  // ... otras opciones
  timezone: 'Z', // 'Z' es el designador de Zulu/UTC
});
```

### 2. Compensar la Zona Horaria del Cliente en el Frontend

En los componentes de React que manejan fechas (como `AvailabilityCalendar.tsx`), se implementó una lógica para neutralizar el efecto de la zona horaria del navegador del cliente.

Antes de pasar las fechas al calendario, se calcula el desfase de la zona horaria del usuario (`getTimezoneOffset()`) y se ajusta la fecha para que el "día" que se renderice coincida con el día en UTC.

**Lógica en `components/custom/AvailabilityCalendar.tsx`:**
```typescript
const fromDate = new Date(booking.check_in_date); // Ej: 2025-10-10T00:00:00.000Z

// getTimezoneOffset() en UTC-3 devuelve 180 (minutos).
// Se convierte a milisegundos y se suma a la fecha.
const fromUTCDate = new Date(fromDate.getTime() + fromDate.getTimezoneOffset() * 60000);

// fromUTCDate ahora representa la fecha correcta para ser mostrada en el calendario.
```

---

## ✅ Próximos Pasos

Esta misma lógica de compensación de zona horaria del frontend debe ser aplicada al `SearchBar` y a cualquier otro componente que utilice un selector de fechas para asegurar una experiencia de usuario consistente en toda la plataforma.

---

## 📝 Intentos de Solución (Sesión Anterior)

A pesar de los esfuerzos, el desfase de un día persiste en el `SearchBar`. A continuación se documentan los cambios realizados:

### Intento 1: Ajuste en el Frontend (`SearchBar.tsx`)
- **Descripción:** Se modificó la función `handleSearch` para ajustar las fechas `from` y `to` restando el `getTimezoneOffset()` antes de enviarlas al backend.
- **Resultado:** El problema persistió, sugiriendo que el backend podría estar reintroduciendo el desfase.

### Intento 2: Ajuste en el Backend (`lib/data.ts` y `lib/utils.ts`)
- **Descripción:**
    1. Se creó una función `formatDateToYYYYMMDD` en `lib/utils.ts` para formatear fechas a `YYYY-MM-DD` sin convertirlas a UTC.
    2. Se utilizó esta función en `searchProperties` (`lib/data.ts`) para formatear `startDate` y `endDate`.
- **Resultado:** El desfase de un día sigue ocurriendo.

---

## 📝 Intentos de Solución (Sesión Actual - Parte 2)

Se realizó una revisión exhaustiva y una refactorización completa del flujo de manejo de fechas desde el `SearchBar` hasta la base de datos. La estrategia fue asegurar un manejo explícito de UTC en cada paso.

### Intento 3: Refactorización End-to-End del Flujo de Fechas

- **Paso 1: `components/custom/SearchBar.tsx`**
  - **Cambio:** Se modificó la función `handleSearch` para construir la fecha utilizando `Date.UTC()`. Esto asegura que la fecha enviada al backend sea una representación UTC pura, independientemente de la zona horaria del cliente.
  - **Código:** `new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()))`

- **Paso 2: `lib/utils.ts`**
  - **Cambio:** Se corrigió la función `formatDateToYYYYMMDD` para que utilice métodos UTC (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`). Esto garantiza que la conversión a `YYYY-MM-DD` sea siempre consistente y basada en UTC.

- **Paso 3: `app/api/chalets/search/route.ts` y `lib/data.ts`**
  - **Cambio:** Se ajustó toda la cadena para que el `route.ts` convierta la cadena de fecha en un objeto `Date` y el `data.ts` utilice la función `formatDateToYYYYMMDD` corregida para formatear la fecha justo antes de la consulta SQL.

- **Resultado:** A pesar de que esta solución es teóricamente robusta y cubre todas las capas de la aplicación, el usuario informa que el desfase de un día **sigue ocurriendo**.

**Estado Actual:** El problema de zona horaria en la búsqueda sigue sin resolverse. La causa raíz es más profunda de lo que parece y no está en el flujo de datos evidente entre el cliente y el servidor. Se requiere una nueva línea de investigación en la próxima sesión, posiblemente revisando la configuración del entorno, la capa de la base de datos (`mysql2`) con más detalle, o buscando efectos secundarios inesperados en el código.

---

## 📝 Intentos de Solución (Sesión Actual - Parte 3)

Se implementó una nueva estrategia con el objetivo de eliminar por completo las conversiones de zona horaria en el backend, tratando las fechas como cadenas de texto `YYYY-MM-DD` en todo el flujo.

### Intento 4: Refactorización a "String-Only" para Fechas

- **Paso 1: `components/custom/SearchBar.tsx` y `components/custom/HeroSection.tsx`**
  - **Cambio:** Se modificó el `SearchBar` para que, al hacer clic en "Buscar", formatee las fechas de `DateRange` a cadenas `YYYY-MM-DD` usando `date-fns`. La función `onSearch` se actualizó para pasar estas cadenas al componente padre (`HeroSection`), que a su vez las incluye en la URL de búsqueda.

- **Paso 2: `app/api/chalets/search/route.ts`**
  - **Cambio:** Se modificó el `route handler` para que lea las fechas de la URL como cadenas de texto y las pase directamente a la función `searchProperties`, eliminando por completo la creación de objetos `new Date()` en el servidor.

- **Paso 3: `lib/data.ts`**
  - **Cambio:** Se actualizó la firma de `searchProperties` para que acepte `startDate` y `endDate` como `string | null`. Se eliminó la llamada a `formatDateToYYYYMMDD` y las cadenas de fecha se pasaron directamente a la consulta SQL.

- **Paso 4: `lib/utils.ts`**
  - **Cambio:** Se eliminó la función `formatDateToYYYYMMDD` del backend, ya que ahora solo se necesita en el frontend.

- **Resultado:** La solución no funcionó. En lugar de un desfase de un día, la búsqueda ahora **ignora por completo el filtro de fechas** y devuelve todas las propiedades, como si no se hubieran proporcionado fechas.

**Estado Actual:** El problema es más complejo. La refactorización a "string-only" rompió el filtro de fechas. La próxima sesión deberá centrarse en depurar por qué la consulta SQL no está filtrando correctamente con las cadenas de fecha `YYYY-MM-DD`. Una posible hipótesis es un problema de *type casting* o formato en la capa de `mysql2` o en la propia consulta SQL.

---

## 📝 Intentos de Solución (Sesión Actual - Parte 4)

Se intentó una solución combinada, atacando tanto el backend como el frontend, basándose en la hipótesis de que el problema era una combinación de una consulta SQL incorrecta y un manejo inadecuado de zonas horarias en el cliente.

### Intento 5: Corrección de Lógica SQL y Forzado de UTC en Frontend

-   **Paso 1: `lib/data.ts` (Backend)**
    -   **Cambio:** Se corrigió la lógica de la subconsulta `NOT EXISTS` para que la comparación de fechas de la búsqueda (`startDate`, `endDate`) se hiciera contra las columnas correctas de la reserva (`check_in_date`, `check_out_date`). Se eliminó el `CAST` a `DATE()` para evitar conversiones inesperadas.
    -   **Código:**
        ```sql
        -- Lógica corregida
        AND ? < b.check_out_date
        AND ? > b.check_in_date
        ```

-   **Paso 2: `components/custom/SearchBar.tsx` (Frontend)**
    -   **Cambio:** Se instaló la librería `date-fns-tz` para forzar el formateo de las fechas a `YYYY-MM-DD` en la zona horaria UTC antes de enviarlas al backend. Esto tenía como objetivo neutralizar cualquier efecto de la zona horaria del navegador.
    -   **Código:**
        ```typescript
        import { format, toZonedTime } from "date-fns-tz";
        // ...
        const startDate = date?.from
          ? format(toZonedTime(date.from, "UTC"), "yyyy-MM-dd", { timeZone: "UTC" })
          : undefined;
        ```

-   **Resultado:** A pesar de que las correcciones parecían lógicamente sólidas y abordaban los problemas identificados, el usuario informa que ambos errores persisten: la búsqueda sigue devolviendo todas las propiedades y el desfase de un día desde la página de inicio continúa.

**Estado Actual:** El problema es más persistente de lo esperado. Las correcciones aplicadas no han surtido efecto, lo que sugiere que la causa raíz podría estar en una capa que no hemos considerado, como la configuración de la conexión a la base de datos a un nivel más profundo, un middleware que esté alterando las fechas, o un comportamiento inesperado de la librería `mysql2` con los tipos `DATE`/`DATETIME`. La próxima sesión deberá enfocarse en una depuración más profunda, posiblemente añadiendo logs en cada paso del flujo de datos para observar cómo se transforma la fecha en cada punto.

---

## 📝 Intentos de Solución (Sesión Actual - Parte 5)

Se identificó que el problema de desfase de fechas se producía al leer los parámetros de la URL en la página `/chalets`. El componente `ChaletsClientPage` utilizaba `new Date(startDate)`, lo que provocaba que el navegador interpretara la fecha en la zona horaria local, causando el desfase.

### Intento 6: Compensación de Zona Horaria en la Lectura de URL

-   **Paso 1: `components/custom/ChaletsClientPage.tsx` (Frontend)**
    -   **Cambio:** Se modificó la lógica que lee las fechas de la URL. En lugar de usar `new Date(startDate)` directamente, se implementó una compensación manual de la zona horaria para neutralizar el efecto del navegador.
    -   **Código:**
        ```typescript
        if (startDate) {
          const fromDate = new Date(startDate);
          const fromUTCDate = new Date(fromDate.getTime() + fromDate.getTimezoneOffset() * 60000);
          
          let toUTCDate: Date | undefined = undefined;
          if (endDate) {
            const toDate = new Date(endDate);
            toUTCDate = new Date(toDate.getTime() + toDate.getTimezoneOffset() * 60000);
          }
          
          dateRange = { from: fromUTCDate, to: toUTCDate };
        }
        ```

-   **Resultado:** Esta solución corrigió el desfase de fechas. El `SearchBar` en la página `/chalets` ahora muestra las fechas correctas que se seleccionaron en la página de inicio.
