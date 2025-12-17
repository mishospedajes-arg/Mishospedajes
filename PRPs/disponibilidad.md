# Guía de Uso y Funcionamiento del Sistema de Disponibilidad

Este documento describe cómo funciona el sistema de gestión de disponibilidad de propiedades a través de la carga de un archivo Excel y cómo debe ser formateado dicho archivo para un correcto funcionamiento.

**Última actualización:** 11/11/2025

---

### **1. Formato del Archivo Excel (`excel_reservas.xlsx`)**

Para que el sistema pueda interpretar correctamente la disponibilidad, el archivo Excel debe seguir una estructura estricta:

-   **Hoja de Cálculo:** El sistema solo leerá la **primera hoja** del libro de Excel.
-   **Fila 3 - IDs de Propiedades:** La tercera fila (fila número 3) debe contener los identificadores únicos de cada propiedad (`map_node_id`), comenzando desde la segunda columna (columna B).
-   **Columna A - Fechas:** La primera columna (columna A) debe contener la lista de fechas, una por fila, comenzando desde la cuarta fila (fila número 4).
-   **Marcación de No Disponibilidad:**
    -   Para marcar un día como **no disponible** para una propiedad específica, se debe colocar una **"X"** (mayúscula o minúscula) en la celda que cruza la fecha (fila) y la propiedad (columna).
    -   Los días **disponibles** deben dejarse con la **celda en blanco**. El sistema ignora cualquier otro valor o formato de color.

**Ejemplo Visual:**

| Fecha      | \_22\_-\_6 | \_23\_-\_1 |
| :--------- | :-------: | :-------: |
| 10/11/2025 |           |     X     |
| 11/11/2025 |     X     |     X     |
| 12/11/2025 |     X     |           |

En este ejemplo:
- El chalet `_23_-_1` no está disponible el 10 y 11 de noviembre.
- El chalet `_22_-_6` no está disponible el 11 y 12 de noviembre.

---

### **2. Flujo de Funcionamiento del Sistema**

El proceso completo, desde la carga del archivo hasta la búsqueda del usuario, funciona de la siguiente manera:

1.  **Carga del Archivo:**
    -   El administrador navega a la sección `/admin/disponibilidad` en el panel de administración.
    -   Selecciona y sube el archivo `excel_reservas.xlsx` actualizado.

2.  **Procesamiento en el Backend (`app/api/disponibilidad/upload/route.ts`):**
    -   El sistema recibe el archivo y lo procesa.
    -   Recorre cada columna de propiedad, buscando las celdas marcadas con "X" para identificar los días no disponibles.
    -   Agrupa los días consecutivos no disponibles en rangos de fechas (`fecha_inicio`, `fecha_fin`).
    -   Antes de insertar los nuevos datos, **elimina todos los registros de disponibilidad anteriores** que fueron cargados por Excel (aquellos con `source = 'excel_upload'`).
    -   Inserta los nuevos rangos en la tabla `Bookings` de la base de datos, marcándolos con `source = 'excel_upload'` para diferenciarlos de las reservas de clientes.

3.  **Búsqueda por Fechas del Usuario (`lib/data.ts`):**
    -   Cuando un usuario realiza una búsqueda en el sitio web e incluye un rango de fechas, el sistema ejecuta una consulta especial.
    -   Esta consulta primero busca en la tabla `Bookings` todas las propiedades que tienen una reserva (`source = 'excel_upload'`) que se solapa con el rango de fechas seleccionado por el usuario.
    -   Finalmente, la búsqueda principal devuelve solo las propiedades que **no** se encontraron en esa lista de no disponibles.

---

### **3. Lógica de Fechas Clave**

Para evitar errores y asegurar consistencia, el sistema maneja los rangos de fechas de la siguiente manera:

-   **`check_in_date`**: Representa el **primer día** en que una propiedad está ocupada.
-   **`check_out_date`**: Representa el **primer día** en que la propiedad vuelve a estar **disponible**.

Por ejemplo, si una propiedad está ocupada del 10 al 12 de noviembre, el sistema guardará:
-   `check_in_date`: 10 de noviembre.
-   `check_out_date`: 13 de noviembre.

Esta lógica asegura que si un usuario busca una propiedad a partir del 13 de noviembre, el sistema la mostrará como disponible.

---

### **Historial de Implementación (Archivado)**

Esta sección contiene las notas originales del proceso de implementación, que ya ha sido completado.

-   **Lógica del Backend Implementada (`app/api/disponibilidad/upload/route.ts`):**
    -   Se implementó el algoritmo completo para leer y procesar el archivo Excel.
    -   La lógica extrae los `map_node_id`, identifica las fechas no disponibles y las agrupa en rangos.
-   **Función de Base de Datos Creada (`lib/data.ts`):**
    -   Se creó la función `updateAvailabilityFromExcel(data)`.
    -   Utiliza una transacción para garantizar la integridad de los datos.
-   **Esquema de Base de Datos Actualizado (`init.sql`):**
    -   Se modificó la tabla `Bookings` para añadir una columna `source`.
-   **Interfaz de Usuario Conectada (`components/custom/UploadForm.tsx`):**
    -   El formulario de subida está conectado al endpoint de la API y muestra notificaciones de estado.
