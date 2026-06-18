# Desplegar en Netlify

Netlify ejecuta aplicaciones frontend como React, pero no ejecuta PHP directamente. Por eso este proyecto conserva la API PHP con SQLite para ejecucion local y usa una simulacion de usuario/pago en la version publicada en Netlify.

## Opcion 1: subir con GitHub

1. Sube la carpeta `tienda-online` a un repositorio de GitHub.
2. Entra a https://app.netlify.com/
3. Selecciona **Add new site**.
4. Selecciona **Import an existing project**.
5. Conecta tu repositorio.
6. Configura:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

7. Presiona **Deploy site**.

## Opcion 2: deploy manual

1. Entra a la carpeta `frontend`.
2. Ejecuta:

```bash
npm run build
```

3. En Netlify, selecciona **Add new site** y luego **Deploy manually**.
4. Arrastra la carpeta:

```text
frontend/dist
```

## Nota para explicar al profesor

El backend PHP se ejecuta localmente con `php -S localhost:8000 -t public`. La version de Netlify muestra el programa web en linea y mantiene el flujo de compra con pago simulado porque Netlify no soporta PHP como servidor backend tradicional.
