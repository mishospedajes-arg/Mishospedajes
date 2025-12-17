# 🚀 Plan de Despliegue: Vagar Vacaciones con Vercel y PlanetScale

Este documento detalla los pasos para desplegar la aplicación Vagar Vacaciones, conectando el frontend en Vercel con una base de datos MySQL "serverless" en PlanetScale.

## Prerrequisitos
- Cuenta de GitHub con el repositorio del proyecto.
- Cuenta de Vercel (puede ser la gratuita/hobby).
- Herramienta de línea de comandos para MySQL (como `mysql-shell` o la que viene con MySQL Community Server) instalada localmente.

---

### Fase 1: Configuración de la Base de Datos en PlanetScale

El objetivo es crear una base de datos MySQL remota que nuestra aplicación en Vercel pueda consumir.

1.  **Crear una Cuenta en PlanetScale**:
    *   Ve a [planetscale.com](https://planetscale.com/) y regístrate en el plan gratuito **"Developer"**.

2.  **Crear una Nueva Base de Datos**:
    *   Desde tu dashboard, crea una nueva base de datos.
    *   **Nombre de la base de datos**: `vagar-mvp` (o el que prefieras).
    *   **Región**: Elige la más cercana a tu ubicación o a la de tus usuarios. `AWS sa-east-1 (São Paulo)` es una excelente opción para Latinoamérica.

3.  **Obtener las Credenciales de Conexión**:
    *   Una vez creada la base de datos, ve a la pestaña **"Connect"**.
    *   Genera una nueva contraseña (`password`). **¡Guarda estas credenciales en un lugar seguro!** Las necesitarás para el siguiente paso y para Vercel. Te proporcionará valores para:
        *   `HOST`
        *   `USERNAME`
        *   `PASSWORD`
        *   `DATABASE_NAME`

---

### Fase 2: Migración de la Estructura y Datos Iniciales

Ahora vamos a replicar la estructura de tu base de datos local en PlanetScale y cargar los datos iniciales.

1.  **Conectarse a PlanetScale desde la Terminal**:
    *   Abre tu terminal o línea de comandos.
    *   Usa el siguiente comando para conectarte, reemplazando los valores con las credenciales que obtuviste:
        ```bash
        mysql -h HOST -u USERNAME -p DATABASE_NAME
        ```
    *   Te pedirá la contraseña (`PASSWORD`). Pégala y presiona Enter.

2.  **Ejecutar el Script de Inicialización (`init.sql`)**:
    *   Una vez conectado, necesitas ejecutar el contenido de tu archivo `init.sql`. La forma más fácil es copiar todo el contenido del archivo `init.sql` y pegarlo directamente en la terminal de MySQL que abriste.
    *   Esto creará todas las tablas (`Properties`, `Experiences`, `Bookings`, etc.) en tu base de datos de PlanetScale.

3.  **Ejecutar el Script de Seeding (`seed.js`)**:
    *   Este paso es crucial para cargar los datos de ejemplo. Deberás adaptar ligeramente tu script `seed.js` para que se conecte a PlanetScale en lugar de a tu Docker local.
    *   Crea un archivo `.env` temporal en tu proyecto con las credenciales de PlanetScale.
    *   Ejecuta el comando de seeding: `pnpm db:seed`.
    *   **Importante**: Una vez terminado, ¡recuerda eliminar el archivo `.env` o revertir los cambios para no subir tus credenciales de producción a GitHub!

---

### Fase 3: Despliegue del Frontend en Vercel

Con la base de datos lista, es hora de desplegar la aplicación Next.js.

1.  **Importar el Proyecto en Vercel**:
    *   Inicia sesión en tu cuenta de Vercel.
    *   Desde el dashboard, haz clic en "Add New... -> Project".
    *   Selecciona tu repositorio de GitHub. Vercel detectará automáticamente que es un proyecto Next.js.

2.  **Configurar las Variables de Entorno**:
    *   Durante el proceso de importación, Vercel te pedirá configurar las "Environment Variables". Aquí es donde conectas Vercel con PlanetScale.
    *   Añade las siguientes variables con los valores de tus credenciales de PlanetScale:
        *   `DB_HOST`
        *   `DB_USER`
        *   `DB_PASS`
        *   `DB_NAME`
    *   **Nota de seguridad**: PlanetScale requiere una conexión SSL. Asegúrate de que tu código de conexión en `lib/db.ts` la esté utilizando. Generalmente, la librería `mysql2` lo maneja si se le pasa un parámetro como `ssl: {"rejectUnauthorized": true}`. Debemos verificar esto.

3.  **Desplegar**:
    *   Haz clic en el botón "Deploy". Vercel se encargará de construir y desplegar tu aplicación.

---

### Fase 4: Verificación y Pruebas Finales

1.  **Probar la Aplicación**:
    *   Una vez que el despliegue termine, Vercel te dará una URL. Ábrela y navega por el sitio.
    *   Verifica que los chalets y experiencias se cargan correctamente desde PlanetScale.
    *   Realiza una consulta de prueba desde el formulario de contacto para asegurar que los datos se guardan en la base de datos remota.

2.  **Configurar el Dominio Personalizado (Opcional)**:
    *   Si tienes un dominio, puedes configurarlo en la pestaña "Domains" de tu proyecto en Vercel.
