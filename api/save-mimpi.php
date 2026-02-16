<?php
/**
 * File: api/save-mimpi.php
 * Deskripsi: Menyimpan atau memperbarui data tafsir mimpi.
 */

require_once 'db.php';

// Pastikan koneksi berhasil
if (!$conn) {
    sendError("Database connection failed: " . ($db_error ?? "Unknown error"), 500);
}

// 1. Tangkap data JSON
$json = file_get_contents("php://input");
if (empty($json)) {
    sendError("Empty request body", 400);
}

$data = json_decode($json);
if (!$data || !isset($data->judul)) {
    sendError("Invalid JSON or missing 'judul' field", 400);
}

try {
    // 2. Generate slug sederhana
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->judul)));
    if (empty($slug)) {
        $slug = "mimpi-" . time();
    }

    // 3. Persiapkan variabel (antisipasi jika ada field kosong dari AI)
    $judul = $data->judul ?? 'Mimpi Tanpa Judul';
    $kategori = $data->kategori ?? 'Umum';
    $ringkasan = $data->ringkasan ?? '';
    $tafsir_positif = $data->tafsir_positif ?? '';
    $tafsir_negatif = $data->tafsir_negatif ?? '';
    $angka = $data->angka ?? '00, 00, 00';

    // 4. Query INSERT dengan ON DUPLICATE KEY UPDATE
    // Pastikan kolom 'slug' atau 'judul' memiliki index UNIQUE di database Anda
    $query = "INSERT INTO mimpi (slug, judul, kategori, ringkasan, tafsir_positif, tafsir_negatif, angka, view_count) 
              VALUES (:slug, :judul, :kategori, :ringkasan, :tafsir_positif, :tafsir_negatif, :angka, 1)
              ON DUPLICATE KEY UPDATE view_count = view_count + 1";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':slug'           => $slug,
        ':judul'          => $judul,
        ':kategori'       => $kategori,
        ':ringkasan'      => $ringkasan,
        ':tafsir_positif' => $tafsir_positif,
        ':tafsir_negatif' => $tafsir_negatif,
        ':angka'          => $angka
    ]);
    
    if ($result) {
        echo json_encode([
            "status" => "success", 
            "message" => "Data synchronized successfully",
            "slug" => $slug
        ]);
    } else {
        sendError("Failed to execute statement", 500);
    }

} catch(PDOException $e) {
    // Berikan pesan error SQL yang spesifik untuk debugging
    sendError("SQL Error: " . $e->getMessage(), 500);
} catch(Exception $e) {
    sendError("System Error: " . $e->getMessage(), 500);
}
?>