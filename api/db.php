
<?php
// Izinkan akses dari mana saja
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // cache selama 1 hari
}

// Header untuk pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// KONFIGURASI DATABASE
$host = "127.0.0.1";
$db_name = "fach6357_misteri";
$username = "fach6357_mridla";
$password = "22hari11bulan";

try {
    $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    if (basename($_SERVER['PHP_SELF']) == 'db.php') {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Koneksi database gagal",
            "debug" => $e->getMessage()
        ]);
        exit();
    }
    $conn = null;
}
?>
