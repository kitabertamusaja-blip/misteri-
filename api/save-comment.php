
<?php
/**
 * File: api/save-comment.php
 */
require_once 'db.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->name) || !isset($data->message)) {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
    exit;
}

try {
    $name = htmlspecialchars(strip_tags($data->name));
    $message = htmlspecialchars(strip_tags($data->message));

    $query = "INSERT INTO comments (name, message) VALUES (:name, :message)";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':name' => $name,
        ':message' => $message
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Comment saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save comment"]);
    }

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
