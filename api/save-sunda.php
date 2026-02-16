
<?php
/**
 * File: api/save-sunda.php
 */
require_once 'db.php';

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$json = file_get_contents("php://input");
$data = json_decode($json);

if (!$data || !isset($data->dob) || !isset($data->content)) {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
    exit;
}

try {
    $dob = $data->dob;
    $wedal = $data->wedal;
    $content = json_encode($data->content);

    $query = "INSERT INTO sunda_cache (dob, wedal, content) 
              VALUES (:dob, :wedal, :content)
              ON DUPLICATE KEY UPDATE content = :content_upd, wedal = :wedal_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':dob' => $dob,
        ':wedal' => $wedal,
        ':content' => $content,
        ':content_upd' => $content,
        ':wedal_upd' => $wedal
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Sundanese data saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save data"]);
    }

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
