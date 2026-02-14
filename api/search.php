<?php
require_once 'db.php';

if (!$conn) {
    sendError("Database connection failed: " . ($db_error ?? "Unknown error"));
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($q)) {
    echo json_encode([]);
    exit();
}

try {
    $query = "SELECT * FROM mimpi WHERE judul LIKE :q ORDER BY view_count DESC LIMIT 10";
    $stmt = $conn->prepare($query);
    $keyword = "%{$q}%";
    $stmt->bindParam(':q', $keyword);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch(Exception $e) {
    sendError($e->getMessage());
}
?>