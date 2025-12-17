# 🖋️ Guía de Implementación — Autenticación del Panel de Administración

## 🌟 Propósito
Este documento detalla la implementación del sistema de autenticación para el panel de administración (`/admin/*`) de la plataforma **Vagar Vacaciones**. Sirve como referencia técnica para entender la arquitectura, el flujo de datos y los pasos de depuración clave.

---

## 🔧 Stack Tecnológico
- **Autenticación:** NextAuth.js
- **Proveedor de Credenciales:** `CredentialsProvider`
- **Hashing de Contraseñas:** `bcryptjs`
- **Base de Datos:** MySQL (gestionada con `mysql2/promise`)

---

## 📁 Estructura de Archivos Clave

A continuación se describen los archivos esenciales que componen el sistema de autenticación:

- **`app/api/auth/[...nextauth]/route.ts`**
  - **Función:** Es el núcleo de la autenticación. Define la configuración de NextAuth, incluyendo el `CredentialsProvider`. La lógica de la función `authorize` se encarga de validar las credenciales del usuario contra la base de datos.

- **`app/login/page.tsx`**
  - **Función:** Contiene el formulario de inicio de sesión con el que interactúa el administrador. Utiliza la función `signIn` de NextAuth para enviar las credenciales al backend.

- **`middleware.ts`**
  - **Función:** Protege todas las rutas bajo el prefijo `/admin/*`. Intercepta las peticiones y redirige a los usuarios no autenticados a la página de `/login`.

- **`scripts/seed.ts`**
  - **Función:** Script de inicialización que puebla la base de datos. Es crucial porque crea el usuario administrador inicial (`admin@vagar.com`) con una contraseña hasheada.

- **`scripts/hash-password.js`**
  - **Función:** Un script de utilidad para generar hashes de contraseñas usando `bcryptjs`. Se utiliza para crear el hash que se inserta en `scripts/seed.ts`.

- **`.env.local`**
  - **Función:** Archivo de configuración crítico. Debe contener tanto las variables de NextAuth (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`) como las credenciales de la base de datos (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

- **`next-auth.d.ts`**
  - **Función:** Archivo de declaración de tipos de TypeScript. Extiende las interfaces `Session` y `JWT` de NextAuth para incluir campos personalizados como `id` y `role`.

---

## 🚀 Flujo de Autenticación

1.  El administrador navega a una ruta protegida (ej. `/admin/dashboard`).
2.  El `middleware.ts` intercepta la petición, detecta que no hay una sesión activa y redirige al usuario a `/login`.
3.  El administrador introduce su email y contraseña en el formulario de `app/login/page.tsx` y hace clic en "Iniciar Sesión".
4.  La función `signIn('credentials', ...)` es llamada, enviando una petición `POST` a ` /api/auth/callback/credentials`.
5.  La función `authorize` en `app/api/auth/[...nextauth]/route.ts` se ejecuta:
    a.  Establece una conexión con la base de datos MySQL.
    b.  Busca un usuario con el email proporcionado.
    c.  Si encuentra al usuario, compara la contraseña enviada con el hash almacenado en la base de datos usando `bcrypt.compare`.
    d.  Si la contraseña coincide, devuelve el objeto del usuario. Si no, devuelve `null`.
6.  Si `authorize` devuelve un usuario, NextAuth crea una sesión (JWT) y redirige al administrador a la página que intentaba acceder originalmente. Si devuelve `null`, el login falla.

---

## 🐞 Guía de Depuración (Lecciones Aprendidas)

El error más común durante la implementación fue el `401 Unauthorized`. Los siguientes pasos fueron cruciales para diagnosticarlo y solucionarlo:

1.  **Verificar las Variables de Entorno:**
    - **Problema:** El archivo `.env.local` no contenía las credenciales de la base de datos (`DB_HOST`, `DB_USER`, etc.).
    - **Solución:** Asegurarse de que **todas** las variables de entorno requeridas estén presentes en `.env.local`. Los valores deben coincidir con los definidos en `docker-compose.yml`.
    - **Acción Clave:** Después de modificar `.env.local`, **es obligatorio reiniciar el servidor de desarrollo de Next.js** para que los cambios surtan efecto.

2.  **Añadir Logs en `authorize`:**
    - **Problema:** Era imposible saber en qué punto exacto fallaba el proceso de autorización.
    - **Solución:** Añadir `console.log` detallados dentro de la función `authorize` para trazar el flujo: recepción de credenciales, conexión a la BD, usuario encontrado, y resultado de la comparación de contraseñas. Esto permitió identificar que la conexión a la BD era el punto de fallo.

3.  **Sincronizar el Hash de la Contraseña:**
    - **Problema:** El hash en la base de datos no coincidía con la contraseña ingresada.
    - **Solución:** Usar el script `scripts/hash-password.js` para generar un hash válido y asegurarse de que este hash esté correctamente copiado en `scripts/seed.ts`. Luego, ejecutar `pnpm exec tsx scripts/seed.ts` para limpiar y repoblar la base de datos, garantizando que el hash almacenado es el correcto.
