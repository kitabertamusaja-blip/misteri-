
<?php
/**
 * File: api/save-chinese-zodiac.php
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
    $shio = $data->shio;
    $content = json_encode($data->content);

    $query = "INSERT INTO chinese_zodiac_cache (dob, shio, content) 
              VALUES (:dob, :shio, :content)
              ON DUPLICATE KEY UPDATE content = :content_upd, shio = :shio_upd";
    
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        ':dob' => $dob,
        ':shio' => $shio,
        ':content' => $content,
        ':content_upd' => $content,
        ':shio_upd' => $shio
    ]);

    if ($result) {
        echo json_encode(["status" => "success", "message" => "Chinese Zodiac data saved"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save data"]);
    }

} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
