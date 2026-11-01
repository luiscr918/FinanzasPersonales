# Nexo financiero

Centro privado de finanzas personales construido con React, TypeScript, Vite, Tailwind CSS y Firebase.

## Inicio local

Requisitos: Node.js 20+ y un proyecto de Firebase.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Completa `.env.local` con la configuración de la aplicación web de Firebase. Estas variables no son credenciales privadas: Firebase protege los datos mediante Authentication y Firestore Rules.

## Firebase

1. Crea un proyecto en Firebase Console.
2. Habilita Authentication > Sign-in method > Email/Password.
3. Crea el primer usuario desde Authentication > Users. No se incluye registro público.
4. Copia la configuración de la aplicación web a `.env.local`.
5. Copia el UID del usuario creado y configúralo como `VITE_AUTHORIZED_UID` en tu entorno local y en Netlify.
6. El UID autorizado ya está aplicado en `firestore.rules`; si creas otro usuario autorizado, actualiza esa regla y vuelve a publicarla.
7. Crea Firestore en modo producción y publica las reglas desde la consola o con Firebase CLI.

```bash
firebase deploy --only firestore:rules
```

No pongas contraseñas, service accounts ni claves privadas en el frontend. El UID no es un secreto, pero las reglas deben desplegarse con el UID correcto.

## Netlify

Conecta el repositorio de GitHub y usa la configuración incluida en `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`

Agrega en Site configuration > Environment variables las variables `VITE_FIREBASE_*` del archivo `.env.example`. Netlify ejecutará el build; no es necesario subir `dist` al repositorio.

## Modelo financiero

Los importes se almacenan como centavos enteros. Los movimientos de terceros cambian el saldo bancario y el pasivo pendiente, pero tienen efecto personal cero. Los objetivos son asignaciones virtuales y no crean cuentas adicionales.

La versión inicial contiene autenticación, dashboard, cuentas, movimientos, transferencias atómicas, ingresos fijos, gastos fijos, separación de terceros, objetivos, reportes base y configuración. Los módulos de proyectos compartidos, edición avanzada y exportación CSV quedan como la siguiente iteración funcional.
