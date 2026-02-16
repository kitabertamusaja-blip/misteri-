<?php
/**
 * File: api/test-db.php
 * Cara Cek: Buka https://www.misteri.faciltrix.com/api/test-db.php di browser Anda.
 */

// Aktifkan error reporting hanya untuk file test ini
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Ambil konfigurasi dari db.php
require_once 'db.php';

if ($conn) {
    echo json_encode([
        "status" => "success",
        "message" => "Koneksi Berhasil!",
        "database" => $db_name,
        "user" => $username,
        "host" => $host,
        "server_info" => $conn->getAttribute(PDO::ATTR_SERVER_INFO)
    ], JSON_PRETTY_PRINT);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Koneksi Gagal!",
        "error_detail" => $db_error,
        "tips" => [
            "1. Pastikan user '$username' sudah ditambahkan ke database '$db_name' di cPanel MySQL Databases.",
            "2. Pastikan password sudah benar.",
            "3. Pastikan Privileges user diatur ke 'ALL PRIVILEGES'.",
            "4. Coba ganti host dari 'localhost' ke '127.0.0.1' atau sebaliknya."
        ]
    ], JSON_PRETTY_PRINT);
}
?>