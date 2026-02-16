<?php
/**
 * File: api/db.php
 * Deskripsi: Koneksi database dengan header CORS yang sangat longgar.
 */

// 1. Matikan pelaporan error ke layar (agar tidak merusak JSON)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 2. Header CORS - Harus paling atas
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Credentials: true");

// 3. Tangani pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// 4. Konfigurasi Database
$host = "127.0.0.1";
$db_name = "fach6357_misteri";
$username = "fach6357_mridla";
$password = "@@22Hari11Bulan"; 

$conn = null;
$db_error = null;

try {
    $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    $db_error = $e->getMessage();
}

/**
 * Fungsi pembantu untuk mengirim respon error JSON
 */
function sendError($msg, $code = 500) {
    http_response_code($code);
    echo json_encode([
        "status" => "error",
        "message" => $msg
    ]);
    exit();
}
?>