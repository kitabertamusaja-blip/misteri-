
<?php
/**
 * File: api/get-comments.php
 */
require_once 'db.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

try {
    $query = "SELECT * FROM comments ORDER BY created_at DESC LIMIT :limit";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    echo json_encode([
        "status" => "success",
        "data" => $rows
    ]);

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
