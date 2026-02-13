<?php
include_once 'db.php';

// Ambil data JSON dari body request
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->judul)) {
    http_response_code(400);
    echo json_encode(["message" => "Data tidak lengkap"]);
    exit();
}

try {
    // Buat slug otomatis dari judul
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->judul)));
    
    // Insert data (Gunakan INSERT IGNORE agar tidak error jika judul/slug sudah ada)
    $query = "INSERT IGNORE INTO mimpi (slug, judul, kategori, ringkasan, tafsir_positif, tafsir_negatif, angka, view_count) 
              VALUES (:slug, :judul, :kategori, :ringkasan, :tafsir_positif, :tafsir_negatif, :angka, 1)";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':slug', $slug);
    $stmt->bindParam(':judul', $data->judul);
    $stmt->bindParam(':kategori', $data->kategori);
    $stmt->bindParam(':ringkasan', $data->ringkasan);
    $stmt->bindParam(':tafsir_positif', $data->tafsir_positif);
    $stmt->bindParam(':tafsir_negatif', $data->tafsir_negatif);
    $stmt->bindParam(':angka', $data->angka);
    
    $stmt->execute();
    
    echo json_encode(["status" => "success", "message" => "Data berhasil disinkronkan"]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>