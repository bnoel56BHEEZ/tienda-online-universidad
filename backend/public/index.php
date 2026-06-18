<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

function requestBody(): array
{
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    return is_array($data) ? $data : [];
}

function database(): PDO
{
    $dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';

    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0777, true);
    }

    $pdo = new PDO('sqlite:' . $dataDir . DIRECTORY_SEPARATOR . 'tienda.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            address TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT "user",
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            transaction_id TEXT NOT NULL,
            total REAL NOT NULL,
            items_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    ');

    seedProducts($pdo);
    ensureUserRoleColumn($pdo);
    seedAdminUser($pdo);

    return $pdo;
}

function ensureUserRoleColumn(PDO $pdo): void
{
    $columns = $pdo->query('PRAGMA table_info(users)')->fetchAll(PDO::FETCH_ASSOC);
    $hasRole = false;

    foreach ($columns as $column) {
        if ($column['name'] === 'role') {
            $hasRole = true;
            break;
        }
    }

    if (!$hasRole) {
        $pdo->exec('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT "user"');
    }
}

function seedProducts(PDO $pdo): void
{
    $products = [
        [1, 'Barra de sonido Aiwa AW-SBH21W-W', 'Audio', 2099, '/products/barra-sonido-aiwa.png'],
        [2, 'Reloj inteligente Stratos 4', 'Tecnologia', 1205, '/products/reloj-inteligente-stratos.png'],
        [3, 'Harman Kardon Luna 2 Bluetooth', 'Audio', 2011, '/products/harman-kardon-luna.png'],
        [4, 'Sony Joystick DualSense PlayStation 5', 'Gaming', 1299, '/products/control-dualsense.png'],
        [5, 'JBL Tune 770NC Black', 'Audio', 1126, '/products/audifonos-jbl-tune.png'],
        [6, 'Frigobar Signa 48 litros', 'Hogar', 3498, '/products/frigobar-signa.png'],
        [7, 'Haylou S40 audifonos gamer ANC', 'Gaming', 677, '/products/audifonos-haylou-s40.png'],
    ];

    $statement = $pdo->prepare('
        INSERT INTO products (id, name, category, price, image)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            price = excluded.price,
            image = excluded.image
    ');

    foreach ($products as $product) {
        $statement->execute($product);
    }
}

function seedAdminUser(PDO $pdo): void
{
    $email = 'admin@tiendanova.com';
    $statement = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $statement->execute([$email]);

    if ($statement->fetch(PDO::FETCH_ASSOC)) {
        return;
    }

    $insert = $pdo->prepare('
        INSERT INTO users (name, email, password, address, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $insert->execute([
        'Administrador',
        $email,
        password_hash('admin123', PASSWORD_DEFAULT),
        'Panel administrativo',
        'admin',
        date('c'),
    ]);
}

function publicUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'address' => $user['address'],
        'role' => $user['role'] ?? 'user',
    ];
}

try {
    $pdo = database();

    if ($path === '/api/products' && $method === 'GET') {
        $products = $pdo->query('SELECT id, name, category, price, image FROM products ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse(['products' => $products]);
        exit;
    }

    if ($path === '/api/users/register' && $method === 'POST') {
        $body = requestBody();

        if (empty($body['name']) || empty($body['email']) || empty($body['password']) || empty($body['address'])) {
            jsonResponse(['error' => 'Completa nombre, correo, contraseña y direccion.'], 422);
            exit;
        }

        $statement = $pdo->prepare('INSERT INTO users (name, email, password, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $statement->execute([
            trim($body['name']),
            strtolower(trim($body['email'])),
            password_hash((string) $body['password'], PASSWORD_DEFAULT),
            trim($body['address']),
            'user',
            date('c'),
        ]);

        $user = $pdo->query('SELECT id, name, email, address, role FROM users WHERE id = ' . (int) $pdo->lastInsertId())->fetch(PDO::FETCH_ASSOC);
        jsonResponse(['message' => 'Usuario registrado correctamente.', 'user' => publicUser($user)], 201);
        exit;
    }

    if ($path === '/api/users/login' && $method === 'POST') {
        $body = requestBody();
        $email = strtolower(trim((string) ($body['email'] ?? '')));

        $statement = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $statement->execute([$email]);
        $user = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify((string) ($body['password'] ?? ''), $user['password'])) {
            jsonResponse(['error' => 'Correo o contraseña incorrectos.'], 401);
            exit;
        }

        $loginMessage = ($user['role'] ?? 'user') === 'admin'
            ? 'Inicio de sesion como administrador.'
            : 'Inicio de sesion como usuario.';

        jsonResponse(['message' => $loginMessage, 'user' => publicUser($user)]);
        exit;
    }

    if ($path === '/api/admin/summary' && $method === 'GET') {
        $totalUsers = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $totalOrders = (int) $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
        $totalSales = (float) $pdo->query('SELECT COALESCE(SUM(total), 0) FROM orders')->fetchColumn();
        $orders = $pdo->query('
            SELECT id, customer_name, customer_email, payment_method, payment_status, transaction_id, total, created_at
            FROM orders
            ORDER BY id DESC
            LIMIT 5
        ')->fetchAll(PDO::FETCH_ASSOC);

        jsonResponse([
            'totalUsers' => $totalUsers,
            'totalOrders' => $totalOrders,
            'totalSales' => $totalSales,
            'recentOrders' => $orders,
        ]);
        exit;
    }

    if ($path === '/api/orders' && $method === 'POST') {
        $body = requestBody();

        if (empty($body['customer']) || empty($body['items']) || empty($body['total']) || empty($body['paymentMethod'])) {
            jsonResponse(['error' => 'Datos incompletos para crear la orden.'], 422);
            exit;
        }

        $transactionId = strtoupper((string) $body['paymentMethod']) . '-' . random_int(100000, 999999);
        $statement = $pdo->prepare('
            INSERT INTO orders (
                user_id, customer_name, customer_email, customer_address, payment_method,
                payment_status, transaction_id, total, items_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $statement->execute([
            $body['customer']['id'] ?? null,
            $body['customer']['name'],
            $body['customer']['email'],
            $body['customer']['address'],
            $body['paymentMethod'],
            'approved',
            $transactionId,
            (float) $body['total'],
            json_encode($body['items'], JSON_UNESCAPED_UNICODE),
            date('c'),
        ]);

        jsonResponse([
            'message' => 'Orden registrada correctamente.',
            'orderId' => 'ORD-' . $pdo->lastInsertId(),
            'transactionId' => $transactionId,
            'paymentStatus' => 'approved',
        ], 201);
        exit;
    }

    if ($path === '/api/payments' && $method === 'POST') {
        $body = requestBody();
        $methodName = $body['method'] ?? 'mercado_pago';
        $total = (float) ($body['total'] ?? 0);

        if ($total <= 0) {
            jsonResponse(['error' => 'El total debe ser mayor a cero.'], 422);
            exit;
        }

        jsonResponse([
            'message' => 'Pago simulado aprobado.',
            'method' => $methodName,
            'status' => 'approved',
            'transactionId' => strtoupper((string) $methodName) . '-' . random_int(100000, 999999),
            'total' => $total,
        ]);
        exit;
    }

    jsonResponse(['error' => 'Ruta no encontrada.'], 404);
} catch (PDOException $error) {
    jsonResponse([
        'error' => 'No se pudo conectar con la base de datos SQLite.',
        'detail' => $error->getMessage(),
    ], 500);
}
