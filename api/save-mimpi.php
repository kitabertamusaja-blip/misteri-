<?php
require_once 'db.php';

if (!$conn) {
    sendError("Database connection failed: " . ($db_error ?? "Unknown error"));
}

// Tangkap data JSON
$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->judul)) {
    sendError("Invalid data received. Required: 'judul'. Data: " . $json, 400);
}

try {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->judul)));
    
    $query = "INSERT INTO mimpi (slug, judul, kategori, ringkasan, tafsir_positif, tafsir_negatif, angka, view_count) 
              VALUES (:slug, :judul, :kategori, :ringkasan, :tafsir_positif, :tafsir_negatif, :angka, 1)
              ON DUPLICATE KEY UPDATE view_count = view_count + 1";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':slug' => $slug,
        ':judul' => $data->judul,
        ':kategori' => $data->kategori,
        ':ringkasan' => $data->ringkasan,
        ':tafsir_positif' => $data->tafsir_positif,
        ':tafsir_negatif' => $data->tafsir_negatif,
        ':angka' => $data->angka
    ]);
    
    echo json_encode([
        "status" => "success", 
        "message" => "Data synchronized successfully"
    ]);
} catch(Exception $e) {
    sendError($e->getMessage());
}
?>