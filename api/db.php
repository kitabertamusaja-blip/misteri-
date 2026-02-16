<?php
/**
 * File: api/db.php
 */

// 1. Matikan output error langsung agar JSON tidak rusak pada produksi
error_reporting(E_ALL);
ini_set('display_errors', 0);

// 2. Header CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Konfigurasi Database
$host = "localhost"; 
$db_name = "fach6357_mistery";
$username = "fach6357_mridla";
$password = "@@22Hari11Bulan"; 

$conn = null;
$db_error = null;

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $db_error = $e->getMessage();
}

if (!function_exists('sendError')) {
    function sendError($msg, $code = 500) {
        http_response_code($code);
        echo json_encode(["status" => "error", "message" => $msg]);
        exit();
    }
}
?>