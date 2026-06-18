# Checklist para evaluacion

## 1. Sistema de tienda en linea individual

Cumple. El sistema permite visualizar productos, agregar al carrito y completar una compra.

## 2. Gestion de usuarios

Cumple. El cliente puede registrarse e iniciar sesion desde la interfaz. El backend guarda usuarios en SQLite mediante:

- `POST /api/users/register`
- `POST /api/users/login`

## 3. Cliente y servidor separados

Cumple. El proyecto esta dividido en:

- `frontend`: React + Tailwind CSS.
- `backend`: API PHP.

## 4. API en PHP

Cumple. El archivo principal del servidor es:

```text
backend/public/index.php
```

## 5. React y Tailwind CSS

Cumple. La interfaz esta desarrollada con React y los estilos usan Tailwind CSS.

## 6. Base de datos

Cumple. La API crea una base de datos SQLite en:

```text
backend/data/tienda.sqlite
```

Tablas principales:

- `users`
- `products`
- `orders`

## 7. Pasarela de pagos

Cumple como simulacion academica. El checkout permite elegir:

- Mercado Pago
- PayPal
- Stripe

La API responde con estado aprobado y folio de transaccion.

## 8. Despliegue web HTTPS

Cumple con Netlify para el frontend. La URL publica se obtiene al desplegar `frontend/dist`.

Nota: Netlify no ejecuta PHP directamente. Por eso la API PHP se muestra localmente y el frontend publicado mantiene el flujo con simulacion para que el programa funcione en internet.

## 9. Manual en GitHub

Cumple. El manual esta en:

```text
manual/manual-proyecto.md
```

## 10. Que mostrar al profesor

1. URL de Netlify con la tienda funcionando.
2. Repositorio de GitHub con todo el codigo.
3. Backend PHP local ejecutandose con `php -S localhost:8000 -t public`.
4. Base de datos creada en `backend/data/tienda.sqlite`.
5. Manual digital dentro del repositorio.
