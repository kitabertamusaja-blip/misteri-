
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Aktifkan error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DETAIL DATABASE
$host = "localhost";
$db_name = "fach6357_misteri";
$username = "fach6357_mridla";
$password = "@@22Hari11Bulan";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8mb4"); // Menggunakan utf8mb4 agar mendukung emoji zodiak
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Koneksi database gagal",
        "debug_message" => $e->getMessage()
    ]);
    exit();
}
?>
