
<?php
/**
 * File: api/save-numerology.php
 * Menyimpan hasil pembacaan numerologi (Life Path) ke DB.
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
    $life_path = $data->life_path_number;
    $content = json_encode($data->content);

    $query = "INSERT INTO numerology_cache (dob, life_path_number, content) 
              VALUES (:dob, :life_path, :content)
              ON DUPLICATE KEY UPDATE content = :content_upd, life_path_number = :lp_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':dob' => $dob,
        ':life_path' => $life_path,
        ':content' => $content,
        ':content_upd' => $content,
        ':lp_upd' => $life_path
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Numerology data saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save data"]);
    }

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
