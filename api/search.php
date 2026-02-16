<?php
require_once 'db.php';

if (!$conn) {
    sendError("Database connection failed: " . ($db_error ?? "Unknown error"));
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

try {
    if (empty($q)) {
        // Jika pencarian kosong, ambil 10 yang paling sering dilihat (untuk Home)
        $query = "SELECT * FROM mimpi ORDER BY view_count DESC LIMIT 10";
        $stmt = $conn->prepare($query);
        $stmt->execute();
    } else {
        // Cari berdasarkan judul
        $query = "SELECT * FROM mimpi WHERE judul LIKE :q ORDER BY view_count DESC LIMIT 10";
        $stmt = $conn->prepare($query);
        $keyword = "%{$q}%";
        $stmt->bindParam(':q', $keyword);
        $stmt->execute();
    }
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch(Exception $e) {
    sendError($e->getMessage());
}
?>