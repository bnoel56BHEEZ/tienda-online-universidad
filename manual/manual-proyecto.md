# Manual digital del proyecto: Tienda Nova

## 1. Objetivo

El objetivo del proyecto es desarrollar una tienda en linea funcional utilizando un frontend en React con Tailwind CSS y una API backend creada en PHP.

## 2. Tecnologias utilizadas

- Visual Studio Code como editor de codigo.
- React para la interfaz del usuario.
- Tailwind CSS para el diseno visual.
- PHP para crear la API.
- SQLite como base de datos.
- JSON para enviar y recibir informacion entre frontend y backend.

## 3. Estructura del proyecto

```text
tienda-online/
  frontend/
    src/
      main.jsx
      styles.css
    package.json
  backend/
    public/
      index.php
  manual/
    manual-proyecto.md
```

## 4. Desarrollo del frontend

Se creo una aplicacion con React que muestra un catalogo de productos. Cada producto incluye nombre, categoria, precio e imagen. El usuario puede agregar productos al carrito, modificar cantidades, eliminar articulos y completar sus datos para realizar la compra.

Tailwind CSS se utilizo para crear una interfaz responsiva, moderna y clara. El diseno incluye una seccion principal de catalogo y un panel lateral de checkout.

## 5. Desarrollo del backend

El backend se realizo con PHP y funciona como una API REST sencilla. El archivo principal es `backend/public/index.php`.

La API permite:

- Consultar productos con `GET /api/products`.
- Registrar usuarios con `POST /api/users/register`.
- Iniciar sesion con `POST /api/users/login`.
- Registrar una orden con `POST /api/orders`.
- Simular un pago con `POST /api/payments`.

La base de datos se genera automaticamente en `backend/data/tienda.sqlite`. Se crearon tres tablas principales:

- `users` para almacenar clientes registrados.
- `products` para almacenar el catalogo.
- `orders` para guardar compras, metodo de pago, total y folio de transaccion.

## 6. Metodos de pago

El proyecto incluye seleccion de metodo de pago con tres opciones:

- Mercado Pago
- PayPal
- Stripe

Para fines escolares, el pago se simula desde la API. Al confirmar la compra, la API responde con un estado aprobado y un folio de transaccion. En un ambiente real, este modulo se conectaria con las APIs oficiales de cada proveedor.

## 7. Como ejecutar el proyecto

### Backend

Desde la carpeta `backend`, ejecutar:

```bash
php -S localhost:8000 -t public
```

### Frontend

Desde la carpeta `frontend`, ejecutar:

```bash
npm install
npm run dev
```

Despues abrir en el navegador la URL indicada por Vite, normalmente `http://localhost:5173`.

## 8. Pruebas realizadas

Se probaron las siguientes funciones:

- Registro de usuario.
- Inicio de sesion.
- Visualizacion del catalogo.
- Agregar productos al carrito.
- Incrementar y disminuir cantidades.
- Eliminar productos.
- Capturar datos del cliente.
- Seleccionar metodo de pago.
- Confirmar compra.
- Guardar la orden en la base de datos.
- Recibir folio de transaccion desde la API PHP.

## 9. Despliegue web

El sistema se preparo para despliegue en Netlify. La parte del cliente se publica en una URL HTTPS usando el build de React. La API PHP y SQLite se ejecutan localmente para mostrar la division cliente-servidor solicitada.

## 10. Conclusion

El proyecto cumple con los requisitos solicitados: una tienda en linea con frontend en React + Tailwind CSS, backend en PHP, base de datos SQLite, gestion de usuarios, opciones de metodo de pago y documentacion digital del proceso de desarrollo.
