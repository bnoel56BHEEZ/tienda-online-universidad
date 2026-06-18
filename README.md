# Tienda en linea universitaria

Proyecto de tienda en linea con frontend en React + Tailwind CSS y backend API en PHP.

## Requisitos

- Visual Studio Code
- Node.js 18 o superior
- PHP 8 o superior

## Ejecutar el frontend

Abre una terminal en la carpeta `frontend` y ejecuta:

```bash
npm install
npm run dev
```

Despues abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Ejecutar el backend

Abre otra terminal en la carpeta `backend` y ejecuta:

```bash
php -S localhost:8000 -t public
```

La API quedara disponible en:

```text
http://localhost:8000
```

La API crea automaticamente una base de datos SQLite en `backend/data/tienda.sqlite`.

## Endpoints principales

- `GET /api/products` muestra los productos.
- `POST /api/users/register` registra un usuario.
- `POST /api/users/login` inicia sesion.
- `GET /api/admin/summary` muestra el resumen del panel administrador.
- `POST /api/orders` registra una orden.
- `POST /api/payments` simula un pago con Stripe, PayPal o Mercado Pago.

## Cuenta de administrador

La API crea automaticamente una cuenta demo de administrador:

```text
Correo: admin@tiendanova.com
Contrasena: admin123
```

Al iniciar sesion con esta cuenta, el frontend muestra una notificacion y abre el panel de administrador.

## Modificar y subir cambios a GitHub

Despues de editar archivos en VS Code:

```bash
git status
git add .
git commit -m "Agrega panel de administrador"
git push
```

## Entregables incluidos

- Programa web en `frontend`.
- API en PHP en `backend`.
- Base de datos SQLite generada por la API.
- Manual digital en `manual/manual-proyecto.md`.
- Guia de despliegue en Netlify en `NETLIFY.md`.
