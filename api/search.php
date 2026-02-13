<?php
include_once 'db.php';

$q = isset($_GET['q']) ? $_GET['q'] : '';

if (empty($q)) {
    echo json_encode([]);
    exit();
}

try {
    // Mencari mimpi yang judulnya mengandung kata kunci
    $query = "SELECT * FROM mimpi WHERE judul LIKE :q ORDER BY view_count DESC LIMIT 10";
    $stmt = $conn->prepare($query);
    $keyword = "%{$q}%";
    $stmt->bindParam(':q', $keyword);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Pastikan angka dikonversi kembali ke format string jika perlu
    echo json_encode($results);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>