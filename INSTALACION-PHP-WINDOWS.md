# Instalar PHP en Windows

En esta computadora `php` no aparece disponible en la terminal. Para ejecutar el backend tienes dos opciones:

## Opcion recomendada: XAMPP

1. Instala XAMPP desde https://www.apachefriends.org/
2. Abre XAMPP Control Panel.
3. Inicia Apache.
4. Busca la ruta donde quedo PHP, normalmente:

```text
C:\xampp\php\php.exe
```

5. En Visual Studio Code puedes ejecutar el backend con:

```bash
C:\xampp\php\php.exe -S localhost:8000 -t backend/public
```

Ese comando se ejecuta desde la carpeta principal `tienda-online`.

## Opcion alternativa: PHP directo

Tambien puedes instalar PHP desde https://windows.php.net/download/ y agregar la carpeta de PHP al PATH de Windows.

Cuando `php` este en el PATH, el backend se ejecuta con:

```bash
php -S localhost:8000 -t backend/public
```
