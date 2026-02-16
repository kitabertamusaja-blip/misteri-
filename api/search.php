<?php
require_once 'db.php';

if (!$conn) {
    sendError("Database Connection Failed: " . $db_error);
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';

try {
    if (empty($q)) {
        $stmt = $conn->prepare("SELECT * FROM mimpi ORDER BY view_count DESC LIMIT 10");
        $stmt->execute();
    } else {
        $stmt = $conn->prepare("SELECT * FROM mimpi WHERE judul LIKE :q ORDER BY view_count DESC LIMIT 10");
        $keyword = "%$q%";
        $stmt->bindParam(':q', $keyword);
        $stmt->execute();
    }
    echo json_encode($stmt->fetchAll());
} catch(Exception $e) {
    sendError($e->getMessage());
}
?>